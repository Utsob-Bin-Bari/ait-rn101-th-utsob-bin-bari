import { syncProcessor } from './syncProcessor';
import { syncQueueService } from './syncQueueService';
import { userSessionStorage } from '../../../infrastructure/storage/userSessionStorage';
import { NetworkService } from '../../../infrastructure/utils';

export const syncDebugService = {
  getSyncStatus: async (): Promise<{
    processorRunning: boolean;
    processorProcessing: boolean;
    hasAccessToken: boolean;
    isOnline: boolean;
    pendingCount: number;
    failedCount: number;
  }> => {
    const sessionResult = await userSessionStorage.get();
    const networkState = await NetworkService.getCurrentNetworkState();
    const queueStats = await syncQueueService.getQueueStats();

    return {
      processorRunning: syncProcessor.isRunning,
      processorProcessing: syncProcessor.processingCount > 0,
      hasAccessToken: !!(sessionResult.success && sessionResult.data?.accessToken),
      isOnline: networkState.isConnected ?? false,
      pendingCount: queueStats.pending,
      failedCount: queueStats.failed,
    };
  },

  logSyncStatus: async (): Promise<void> => {
    const status = await syncDebugService.getSyncStatus();
    console.warn(`Processor Running:    ${status.processorRunning ? '✓ YES' : '✗ NO'}`);
    console.warn(`Currently Processing: ${status.processorProcessing ? '✓ YES' : '✗ NO'}`);
    console.warn(`Has Access Token:     ${status.hasAccessToken ? '✓ YES' : '✗ NO'}`);
    console.warn(`Device Online:        ${status.isOnline ? '✓ YES' : '✗ NO'}`);
    console.warn(`Pending Operations:   ${status.pendingCount}`);
    console.warn(`Failed Operations:    ${status.failedCount}`);
    
    if (!status.processorRunning) {
      console.error('ISSUE: Sync processor is NOT running!');
    }
    if (!status.hasAccessToken) {
      console.error('ISSUE: No access token found!');
    }
    if (!status.isOnline) {
      console.error('ISSUE: Device appears to be offline!');
    }
    if (status.pendingCount > 0 && status.isOnline && status.hasAccessToken && status.processorRunning) {
      console.error('ISSUE: Sync should be running but operations are still pending!');
    }
  },
};

