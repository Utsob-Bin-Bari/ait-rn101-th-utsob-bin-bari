import { syncQueueService } from '../src/application/services/tasks/syncQueueService';
import { DatabaseInit } from '../src/infrastructure/storage';

jest.mock('../src/infrastructure/storage');

describe('Sync Management Tests', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn(),
      executeSql: jest.fn(),
    };

    (DatabaseInit.getInstance as jest.Mock).mockReturnValue({
      getDatabase: () => mockDb,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Expected Behavior', () => {
    test('completed operations should be deleted from queue, not marked as completed', async () => {
      const operationId = 123;

      mockDb.transaction.mockImplementation((callback: any) => {
        const tx = {
          executeSql: (sql: string, params: any[], success: any, error: any) => {
            if (sql.includes('DELETE FROM sync_queue')) {
              success(null, { rowsAffected: 1 });
            }
          },
        };
        callback(tx);
      });

      await syncQueueService.markOperationCompleted(operationId);

      expect(mockDb.transaction).toHaveBeenCalled();
      const transactionCallback = mockDb.transaction.mock.calls[0][0];
      const mockTx = {
        executeSql: jest.fn((sql: string, params: any[], success: any) => {
          expect(sql).toContain('DELETE FROM sync_queue');
          expect(sql).not.toContain('UPDATE');
          expect(params).toContain(operationId);
          success(null, { rowsAffected: 1 });
        }),
      };
      transactionCallback(mockTx);
    });

    test('getQueueStats should not count completed operations', async () => {
      mockDb.transaction.mockImplementation((callback: any) => {
        const tx = {
          executeSql: (sql: string, params: any[], success: any) => {
            const result = {
              rows: {
                length: 1,
                item: (index: number) => ({
                  pending: 0,
                  completed: 0,
                  failed: 0,
                }),
              },
            };
            success(null, result);
          },
        };
        callback(tx);
      });

      const stats = await syncQueueService.getQueueStats();

      expect(stats).toEqual({
        pending: 0,
        completed: 0,
        failed: 0,
      });
    });

    test('settings and sync management should show same pending count', async () => {
      const mockOperations = [
        { id: 1, status: 'pending' },
        { id: 2, status: 'failed' },
      ];

      mockDb.transaction.mockImplementation((callback: any) => {
        const tx = {
          executeSql: (sql: string, params: any[], success: any) => {
            if (sql.includes('SUM(CASE WHEN status')) {
              const result = {
                rows: {
                  length: 1,
                  item: (index: number) => ({
                    pending: 1,
                    failed: 1,
                    completed: 0,
                    total: 2,
                  }),
                },
              };
              success(null, result);
            }
          },
        };
        callback(tx);
      });

      const realStatus = await syncQueueService.getRealQueueStatus();
      const queueStats = await syncQueueService.getQueueStats();

      expect(realStatus.pending).toBe(queueStats.pending);
      expect(realStatus.failed).toBe(queueStats.failed);
    });
  });

  describe('Sync Queue Lifecycle', () => {
    test('new operation should be added with pending status', async () => {
      const insertId = 456;

      mockDb.transaction.mockImplementation((callback: any) => {
        const tx = {
          executeSql: (sql: string, params: any[], success: any) => {
            expect(sql).toContain('INSERT INTO sync_queue');
            expect(params).toContain('pending');
            success(null, { insertId });
          },
        };
        callback(tx);
      });

      const result = await syncQueueService.addToQueue('create', 'task', 'task-123');
      expect(result).toBe(insertId);
    });

    test('failed operation can be retried', async () => {
      const operationId = 789;

      mockDb.transaction.mockImplementation((callback: any) => {
        const tx = {
          executeSql: (sql: string, params: any[], success: any) => {
            expect(sql).toContain('UPDATE sync_queue');
            expect(sql).toContain('retry_count = 0');
            expect(sql).toContain("status = 'pending'");
            expect(params).toContain(operationId);
            success(null, { rowsAffected: 1 });
          },
        };
        callback(tx);
      });

      await syncQueueService.resetFailedOperation(operationId);
    });

    test('completed operations should not appear in getAllOperations after deletion', async () => {
      mockDb.transaction.mockImplementation((callback: any) => {
        const tx = {
          executeSql: (sql: string, params: any[], success: any) => {
            const result = {
              rows: {
                length: 2,
                item: (index: number) => {
                  if (index === 0) return { id: 1, status: 'pending' };
                  return { id: 2, status: 'failed' };
                },
              },
            };
            success(null, result);
          },
        };
        callback(tx);
      });

      const operations = await syncQueueService.getAllOperations();
      
      const hasCompleted = operations.some((op: any) => op.status === 'completed');
      expect(hasCompleted).toBe(false);
    });
  });

  describe('Status Consistency', () => {
    test('when no operations exist, both screens should show synced', async () => {
      mockDb.transaction.mockImplementation((callback: any) => {
        const tx = {
          executeSql: (sql: string, params: any[], success: any) => {
            const result = {
              rows: {
                length: 1,
                item: (index: number) => ({
                  pending: 0,
                  failed: 0,
                  completed: 0,
                  total: 0,
                }),
              },
            };
            success(null, result);
          },
        };
        callback(tx);
      });

      const queueStats = await syncQueueService.getQueueStats();
      const realStatus = await syncQueueService.getRealQueueStatus();

      expect(queueStats.pending).toBe(0);
      expect(realStatus.pending).toBe(0);
      expect(realStatus.total).toBe(0);
    });

    test('when operation is completed, it should be removed from queue immediately', async () => {
      const operationId = 999;
      let operationExists = true;

      mockDb.transaction.mockImplementation((callback: any) => {
        const tx = {
          executeSql: (sql: string, params: any[], success: any) => {
            if (sql.includes('DELETE FROM sync_queue')) {
              operationExists = false;
              success(null, { rowsAffected: 1 });
            } else if (sql.includes('SELECT * FROM sync_queue')) {
              const result = {
                rows: {
                  length: operationExists ? 1 : 0,
                  item: (index: number) => ({ id: operationId, status: 'pending' }),
                },
              };
              success(null, result);
            }
          },
        };
        callback(tx);
      });

      await syncQueueService.markOperationCompleted(operationId);
      
      const operations = await syncQueueService.getAllOperations();
      expect(operations.length).toBe(0);
    });
  });

  describe('Cleanup Operations', () => {
    test('clearCompletedOperations should remove all completed entries', async () => {
      mockDb.transaction.mockImplementation((callback: any) => {
        const tx = {
          executeSql: (sql: string, params: any[], success: any) => {
            expect(sql).toContain("DELETE FROM sync_queue WHERE status = 'completed'");
            success(null, { rowsAffected: 5 });
          },
        };
        callback(tx);
      });

      await syncQueueService.clearCompletedOperations();
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
});

