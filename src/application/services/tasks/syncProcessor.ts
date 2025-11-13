import { syncQueueService, QueueOperation } from './syncQueueService';
import { tasksSQLiteService } from './tasksSQLiteService';
import { userSessionStorage } from '../../../infrastructure/storage/userSessionStorage';
import { OPERATION_TYPES, ENTITY_TYPES, DatabaseHelpers } from '../../../infrastructure/storage/DatabaseSchema';
import { NetworkService } from '../../../infrastructure/utils';

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
  const isGuest = await userSessionStorage.isGuestSession();
  if (isGuest) {
    return;
  }

  if (syncProcessor.isRunning) {
    return;
  }

  syncProcessor.isRunning = true;

  await processQueueOnce();

  syncProcessor.intervalId = setInterval(async () => {
    await processQueueOnce();
  }, 10000);
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
  const isGuest = await userSessionStorage.isGuestSession();
  if (isGuest) {
    return;
  }

  if (syncProcessor.processingCount > 0) {
    console.warn('Sync processor already running, skipping...');
    return;
  }

  try {
    syncProcessor.processingCount++;

    const networkState = await NetworkService.getCurrentNetworkState();
    if (!networkState.isConnected) {
      console.warn('Sync skipped: Device is offline');
      return;
    }

    const sessionResult = await userSessionStorage.get();
    if (!sessionResult.success || !sessionResult.data?.accessToken) {
      console.warn('Sync skipped: No valid session or access token');
      return;
    }

    const accessToken = sessionResult.data.accessToken;

    const pendingOperations = await syncQueueService.getPendingOperations();
    
    if (pendingOperations.length === 0) {
      return;
    }

    console.warn(`Starting sync for ${pendingOperations.length} pending operation(s)`);

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
          await syncQueueService.markOperationCompleted(operation.id);
          console.warn(`✓ Synced ${operation.operation_type} ${operation.entity_type}`);
          await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
        } else {
          failedCount++;
          await syncQueueService.incrementRetryCount(operation.id);
          console.error(`✗ Failed to sync ${operation.operation_type} ${operation.entity_type}`);
          break;
        }
      } catch (error) {
        console.error(`Error processing sync operation ${operation.id}:`, error);
        await syncQueueService.incrementRetryCount(operation.id);
        failedCount++;
        break;
      }
    }

    if (processedCount > 0 || failedCount > 0) {
      console.warn(`Sync completed: ${processedCount} successful, ${failedCount} failed`);
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

export const manualProcessQueue = async (): Promise<{ processed: number; failed: number }> => {
  try {
    console.warn('Manual sync triggered');
    
    const networkState = await NetworkService.getCurrentNetworkState();
    if (!networkState.isConnected) {
      console.error('Manual sync failed: Device is offline');
      return { processed: 0, failed: 0 };
    }

    await processQueueOnce();
    
    const queueStatus = await syncQueueService.getRealQueueStatus();
    
    return { 
      processed: 0,
      failed: queueStatus.failed || 0 
    };
  } catch (error) {
    console.error('Error in manual queue processing:', error);
    return { processed: 0, failed: 0 };
  }
};

