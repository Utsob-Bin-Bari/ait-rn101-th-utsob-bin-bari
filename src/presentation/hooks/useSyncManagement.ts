import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { syncQueueService, QueueOperation } from '../../application/services/tasks/syncQueueService';
import { syncCleanupService } from '../../application/services/tasks/syncCleanupService';
import { manualProcessQueue } from '../../application/services/tasks/syncProcessor';

type OperationState = 'idle' | 'loading' | 'completed' | 'failed';

export const useSyncManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [allOperations, setAllOperations] = useState<QueueOperation[]>([]);
  const [pendingOperations, setPendingOperations] = useState<QueueOperation[]>([]);
  const [failedOperations, setFailedOperations] = useState<QueueOperation[]>([]);
  const [realQueueStatus, setRealQueueStatus] = useState<{
    pending: number;
    failed: number;
    completed: number;
    total: number;
  }>({ 
    pending: 0, 
    failed: 0, 
    completed: 0, 
    total: 0 
  });
  const [queueStatus, setQueueStatus] = useState<{ pending: number; failed: number }>({ 
    pending: 0, 
    failed: 0 
  });
  const [operationStates, setOperationStates] = useState<{[key: number]: OperationState}>({});

  const loadSyncData = async () => {
    try {
      setLoading(true);
      setError('');
      
      await syncCleanupService.performInitialCleanup();
      
      const allOps = await syncQueueService.getAllOperations();
      setAllOperations(allOps);
      
      const pending = allOps.filter(op => op.status === 'pending');
      const failed = allOps.filter(op => op.status === 'failed');
      
      setPendingOperations(pending);
      setFailedOperations(failed);
      
      const realStatus = await syncQueueService.getRealQueueStatus();
      setRealQueueStatus(realStatus);
      
      setQueueStatus({ 
        pending: realStatus.pending, 
        failed: realStatus.failed 
      });
      
    } catch (error: any) {
      console.error('Error loading sync data:', error);
      setError(error.message || 'Failed to load sync data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOperation = async (operationId: number) => {
    setOperationStates(prev => ({ ...prev, [operationId]: 'loading' }));
    
    try {
      const operation = allOperations.find(op => op.id === operationId);
      const operationName = operation ? 
        `${operation.operation_type.toUpperCase()} ${operation.entity_type} (${operation.entity_id.substring(0, 8)})` :
        `Operation #${operationId}`;
      
      Alert.alert(
        'Delete Operation', 
        `Are you sure you want to delete "${operationName}"?`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel', 
            onPress: () => {
              setOperationStates(prev => ({ ...prev, [operationId]: 'idle' }));
            }
          },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                await syncQueueService.markOperationCompleted(operationId);
                setOperationStates(prev => ({ ...prev, [operationId]: 'completed' }));
                
                setTimeout(async () => {
                  await loadSyncData();
                  setOperationStates(prev => ({ ...prev, [operationId]: 'idle' }));
                }, 500);
              } catch (deleteError: any) {
                console.error('Error deleting operation:', deleteError);
                setOperationStates(prev => ({ ...prev, [operationId]: 'failed' }));
                setTimeout(() => {
                  setOperationStates(prev => ({ ...prev, [operationId]: 'idle' }));
                }, 2000);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in delete operation handler:', error);
      setOperationStates(prev => ({ ...prev, [operationId]: 'failed' }));
      setTimeout(() => {
        setOperationStates(prev => ({ ...prev, [operationId]: 'idle' }));
      }, 2000);
    }
  };

  const handleSyncOperation = async (operationId: number) => {
    setOperationStates(prev => ({ ...prev, [operationId]: 'loading' }));
    
    try {
      await syncQueueService.resetFailedOperation(operationId);
      
      await manualProcessQueue();
      
      setOperationStates(prev => ({ ...prev, [operationId]: 'completed' }));
      
      setTimeout(async () => {
        await loadSyncData();
        setOperationStates(prev => ({ ...prev, [operationId]: 'idle' }));
      }, 1000);
      
    } catch (error: any) {
      console.error('Error retrying operation:', error);
      setOperationStates(prev => ({ ...prev, [operationId]: 'failed' }));
      setTimeout(() => {
        setOperationStates(prev => ({ ...prev, [operationId]: 'idle' }));
      }, 3000);
    }
  };

  const handleSyncAll = async () => {
    try {
      setLoading(true);
      setError('');
      
      const resetCount = await syncQueueService.resetAllFailedOperations();
      
      if (resetCount === 0) {
        Alert.alert(
          'No Failed Operations',
          'There are no failed operations to retry.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      await manualProcessQueue();
      
      await loadSyncData();
      
      Alert.alert(
        'Retry Completed',
        `Reset ${resetCount} failed operation(s) and triggered sync processing. Check the operations list for updated status.`,
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      console.error('Error in sync all operations:', error);
      setError(error.message || 'Failed to retry operations');
      Alert.alert(
        'Retry Failed',
        'Failed to retry operations. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSyncData();
  }, []);

  return {
    loading,
    error,
    allOperations,
    pendingOperations,
    failedOperations,
    queueStatus,
    realQueueStatus,
    operationStates,
    handleDeleteOperation,
    handleSyncOperation,
    handleSyncAll,
    loadSyncData,
  };
};

