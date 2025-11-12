import { syncQueueService } from './syncQueueService';

export const syncCleanupService = {
  cleanupCompletedOperations: async (): Promise<{
    success: boolean;
    cleaned: number;
  }> => {
    try {
      const allOperations = await syncQueueService.getAllOperations();
      const completedOps = allOperations.filter(op => op.status === 'completed');
      
      if (completedOps.length > 0) {
        await syncQueueService.clearCompletedOperations();
        return {
          success: true,
          cleaned: completedOps.length
        };
      }
      
      return {
        success: true,
        cleaned: 0
      };
    } catch (error: any) {
      console.error('Error cleaning up completed operations:', error);
      return {
        success: false,
        cleaned: 0
      };
    }
  },

  performInitialCleanup: async (): Promise<void> => {
    try {
      const result = await syncCleanupService.cleanupCompletedOperations();
      if (result.cleaned > 0) {
        console.warn(`Cleaned up ${result.cleaned} completed sync operations`);
      }
    } catch (error: any) {
      console.error('Error during initial sync cleanup:', error);
    }
  }
};

