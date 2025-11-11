import { syncQueueService, QueueOperation } from './syncQueueService';
import { tasksSQLiteService } from './tasksSQLiteService';
import { userSessionStorage } from '../../../infrastructure/storage/userSessionStorage';
import { OPERATION_TYPES, ENTITY_TYPES, DatabaseHelpers } from '../../../infrastructure/storage/DatabaseSchema';
import NetInfo from '@react-native-community/netinfo';

interface SyncProcessor {
  isRunning: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  processingCount: number;
}

export const syncProcessor: SyncProcessor = {
  isRunning: false,
  intervalId: null,
  processingCount: 0,
};

export const startSyncProcessor = async (): Promise<void> => {
  if (syncProcessor.isRunning) {
    return;
  }

  syncProcessor.isRunning = true;

  await processQueueOnce();

  syncProcessor.intervalId = setInterval(async () => {
    await processQueueOnce();
  }, 30000);
};

export const stopSyncProcessor = async (): Promise<void> => {
  if (!syncProcessor.isRunning) {
    return;
  }

  if (syncProcessor.intervalId) {
    clearInterval(syncProcessor.intervalId);
    syncProcessor.intervalId = null;
  }

  syncProcessor.isRunning = false;
};

const processQueueOnce = async (): Promise<void> => {
  if (syncProcessor.processingCount > 0) {
    return;
  }

  try {
    syncProcessor.processingCount++;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      return;
    }

    const sessionResult = await userSessionStorage.get();
    if (!sessionResult.success || !sessionResult.data?.accessToken) {
      return;
    }

    const accessToken = sessionResult.data.accessToken;

    const pendingOperations = await syncQueueService.getPendingOperations();
    
    if (pendingOperations.length === 0) {
      return;
    }

    let processedCount = 0;
    let failedCount = 0;

    for (const operation of pendingOperations) {
      try {
        let success = false;
        
        await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
        
        if (operation.operation_type === OPERATION_TYPES.CREATE) {
          success = await processCreateOperation(operation, accessToken);
        } else if (operation.operation_type === OPERATION_TYPES.UPDATE) {
          success = await processUpdateOperation(operation, accessToken);
        } else if (operation.operation_type === OPERATION_TYPES.DELETE) {
          success = await processDeleteOperation(operation, accessToken);
        }

        if (success) {
          processedCount++;
          await syncQueueService.markAsCompleted(operation.id);
          await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
        } else {
          failedCount++;
          await syncQueueService.markAsFailed(operation.id);
          break;
        }
      } catch (error) {
        console.error(`Error processing sync operation ${operation.id}:`, error);
        await syncQueueService.markAsFailed(operation.id);
        failedCount++;
        break;
      }
    }

  } catch (error) {
    console.error('Error in sync processor:', error);
  } finally {
    syncProcessor.processingCount--;
  }
};

const processCreateOperation = async (operation: QueueOperation, accessToken: string): Promise<boolean> => {
  try {
    const payload = operation.payload ? JSON.parse(operation.payload) : null;
    if (!payload) return false;

    const { createTaskRequest } = await import('../../../infrastructure/api/requests/tasks/createTaskRequest');
    const result = await createTaskRequest(payload, accessToken);

    if (result.success && result.data) {
      await tasksSQLiteService.updateTaskServerId(operation.entity_id, result.data.id);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error processing create operation:', error);
    return false;
  }
};

const processUpdateOperation = async (operation: QueueOperation, accessToken: string): Promise<boolean> => {
  try {
    const payload = operation.payload ? JSON.parse(operation.payload) : null;
    if (!payload) return false;

    const task = await tasksSQLiteService.getTaskById(operation.entity_id);
    if (!task) return false;

    const taskId = task.server_id || task.local_id;

    const { updateTaskRequest } = await import('../../../infrastructure/api/requests/tasks/updateTaskRequest');
    const result = await updateTaskRequest(taskId, payload, accessToken);

    if (result.success) {
      await tasksSQLiteService.markTaskAsSynced(operation.entity_id);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error processing update operation:', error);
    return false;
  }
};

const processDeleteOperation = async (operation: QueueOperation, accessToken: string): Promise<boolean> => {
  try {
    const task = await tasksSQLiteService.getTaskById(operation.entity_id);
    if (!task) {
      return true;
    }

    const taskId = task.server_id;
    if (!taskId) {
      await tasksSQLiteService.permanentlyDeleteTask(operation.entity_id);
      return true;
    }

    const { deleteTaskRequest } = await import('../../../infrastructure/api/requests/tasks/deleteTaskRequest');
    const result = await deleteTaskRequest(taskId, accessToken);

    if (result.success) {
      await tasksSQLiteService.permanentlyDeleteTask(operation.entity_id);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error processing delete operation:', error);
    return false;
  }
};

export const triggerImmediateSync = async (): Promise<{ processed: number; failed: number }> => {
  try {
    await processQueueOnce();
    return { processed: 1, failed: 0 };
  } catch (error) {
    console.error('Error in immediate sync:', error);
    return { processed: 0, failed: 1 };
  }
};

export const getSyncProcessorStatus = (): { isRunning: boolean; isProcessing: boolean } => {
  return {
    isRunning: syncProcessor.isRunning,
    isProcessing: syncProcessor.processingCount > 0
  };
};

