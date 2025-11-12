import { DatabaseInit, DatabaseHelpers } from '../../../infrastructure/storage';

export interface QueueOperation {
  id: number;
  operation_type: string;
  entity_type: string;
  entity_id: string;
  payload: string | null;
  created_at: string;
  retry_count: number;
  max_retries: number;
  status: string;
}

export const syncQueueService = {
  addToQueue: async (
    operationType: string,
    entityType: string,
    entityId: string,
    payload?: any
  ): Promise<number> => {
    const db = DatabaseInit.getInstance().getDatabase();
    const timestamp = DatabaseHelpers.getCurrentTimestamp();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO sync_queue (
            operation_type, entity_type, entity_id, payload, 
            created_at, retry_count, max_retries, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            operationType,
            entityType,
            entityId,
            payload ? JSON.stringify(payload) : null,
            timestamp,
            0,
            3,
            'pending'
          ],
          (_, result) => {
            resolve(result.insertId!);
          },
          (_, error) => {
            console.error('Error adding to sync queue:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  getPendingOperations: async (): Promise<QueueOperation[]> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM sync_queue 
           WHERE status = 'pending' 
           ORDER BY created_at ASC`,
          [],
          (_, result) => {
            const operations: QueueOperation[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              operations.push(result.rows.item(i) as QueueOperation);
            }
            resolve(operations);
          },
          (_, error) => {
            console.error('Error fetching pending operations:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  markAsCompleted: async (operationId: number): Promise<void> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE sync_queue SET status = 'completed' WHERE id = ?`,
          [operationId],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            console.error('Error marking operation as completed:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  markAsFailed: async (operationId: number): Promise<void> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE sync_queue 
           SET retry_count = retry_count + 1, 
               status = CASE 
                 WHEN retry_count + 1 >= max_retries THEN 'failed' 
                 ELSE 'pending' 
               END 
           WHERE id = ?`,
          [operationId],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            console.error('Error marking operation as failed:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  deleteOperation: async (operationId: number): Promise<void> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM sync_queue WHERE id = ?`,
          [operationId],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            console.error('Error deleting operation:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  clearCompletedOperations: async (): Promise<void> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM sync_queue WHERE status = 'completed'`,
          [],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            console.error('Error clearing completed operations:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  clearFailedOperations: async (): Promise<void> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM sync_queue WHERE status = 'failed'`,
          [],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            console.error('Error clearing failed operations:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  getQueueStats: async (): Promise<{
    pending: number;
    completed: number;
    failed: number;
  }> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT 
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
           FROM sync_queue`,
          [],
          (_, result) => {
            const row = result.rows.item(0);
            resolve({
              pending: row.pending || 0,
              completed: 0,
              failed: row.failed || 0
            });
          },
          (_, error) => {
            console.error('Error fetching queue stats:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  getAllOperations: async (): Promise<QueueOperation[]> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM sync_queue ORDER BY created_at ASC`,
          [],
          (_, result) => {
            const operations: QueueOperation[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              operations.push(result.rows.item(i) as QueueOperation);
            }
            resolve(operations);
          },
          (_, error) => {
            console.error('Error fetching all operations:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  getFailedOperations: async (): Promise<QueueOperation[]> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM sync_queue 
           WHERE status = 'failed' 
           ORDER BY created_at ASC`,
          [],
          (_, result) => {
            const operations: QueueOperation[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              operations.push(result.rows.item(i) as QueueOperation);
            }
            resolve(operations);
          },
          (_, error) => {
            console.error('Error fetching failed operations:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  getRealQueueStatus: async (): Promise<{
    pending: number;
    failed: number;
    completed: number;
    total: number;
  }> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT 
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            COUNT(*) as total
           FROM sync_queue`,
          [],
          (_, result) => {
            const row = result.rows.item(0);
            resolve({
              pending: row.pending || 0,
              failed: row.failed || 0,
              completed: 0,
              total: row.total || 0
            });
          },
          (_, error) => {
            console.error('Error fetching real queue status:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  resetFailedOperation: async (operationId: number): Promise<void> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE sync_queue SET status = 'pending', retry_count = 0 WHERE id = ?`,
          [operationId],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            console.error('Error resetting failed operation:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  resetAllFailedOperations: async (): Promise<number> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE sync_queue SET status = 'pending', retry_count = 0 WHERE status = 'failed'`,
          [],
          (_, result) => {
            resolve(result.rowsAffected || 0);
          },
          (_, error) => {
            console.error('Error resetting all failed operations:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  markOperationCompleted: async (operationId: number): Promise<void> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM sync_queue WHERE id = ?`,
          [operationId],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            console.error('Error deleting completed operation:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  incrementRetryCount: async (operationId: number): Promise<void> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE sync_queue 
           SET retry_count = retry_count + 1,
               status = CASE 
                 WHEN retry_count + 1 >= max_retries THEN 'failed' 
                 ELSE status 
               END 
           WHERE id = ?`,
          [operationId],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            console.error('Error incrementing retry count:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  getQueueStatus: async (): Promise<{ pending: number; failed: number }> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT 
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
           FROM sync_queue`,
          [],
          (_, result) => {
            const row = result.rows.item(0);
            resolve({
              pending: row.pending || 0,
              failed: row.failed || 0
            });
          },
          (_, error) => {
            console.error('Error fetching queue status:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

