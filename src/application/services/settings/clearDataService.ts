import { DatabaseInit } from '../../../infrastructure/storage';

export const clearDataService = {
  clearAllDataExceptUser: async (): Promise<{
    success: boolean;
    error?: string;
    cleared: {
      tasks: number;
      syncQueue: number;
      appSettings: number;
    };
  }> => {
    const db = DatabaseInit.getInstance().getDatabase();
    
    return new Promise((resolve) => {
      let cleared = {
        tasks: 0,
        syncQueue: 0,
        appSettings: 0,
      };

      db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM tasks',
            [],
            (_, result) => {
              cleared.tasks = result.rowsAffected;
            },
            (_, error) => {
              console.error('Error deleting tasks:', error);
              return false;
            }
          );

          tx.executeSql(
            'DELETE FROM sync_queue',
            [],
            (_, result) => {
              cleared.syncQueue = result.rowsAffected;
            },
            (_, error) => {
              console.error('Error deleting sync queue:', error);
              return false;
            }
          );

          tx.executeSql(
            'DELETE FROM app_settings WHERE key NOT IN ("app_version", "database_version")',
            [],
            (_, result) => {
              cleared.appSettings = result.rowsAffected;
            },
            (_, error) => {
              console.error('Error deleting app settings:', error);
              return false;
            }
          );

          tx.executeSql(
            'SELECT COUNT(*) as count FROM user_session',
            [],
            (_, result) => {
              const count = result.rows.item(0).count;
            },
            (_, error) => {
              console.error('Error verifying user session:', error);
              return false;
            }
          );
        },
        (error) => {
          console.error('Transaction error:', error);
          resolve({
            success: false,
            error: 'Failed to clear data',
            cleared
          });
        },
        () => {
          resolve({
            success: true,
            cleared
          });
        }
      );
    });
  },

  getDataStatistics: async (): Promise<{
    tasks: number;
    syncQueue: number;
  }> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve, reject) => {
      let stats = {
        tasks: 0,
        syncQueue: 0,
      };

      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT COUNT(*) as count FROM tasks WHERE is_deleted = 0',
            [],
            (_, result) => {
              stats.tasks = result.rows.item(0).count;
            }
          );

          tx.executeSql(
            'SELECT COUNT(*) as count FROM sync_queue',
            [],
            (_, result) => {
              stats.syncQueue = result.rows.item(0).count;
            }
          );
        },
        (error) => {
          console.error('Error getting stats:', error);
          reject(error);
        },
        () => {
          resolve(stats);
        }
      );
    });
  },

  verifyUserSession: async (): Promise<boolean> => {
    const db = DatabaseInit.getInstance().getDatabase();

    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM user_session',
          [],
          (_, result) => {
            const count = result.rows.item(0).count;
            resolve(count > 0);
          },
          (_, error) => {
            console.error('Error verifying user session:', error);
            resolve(false);
            return false;
          }
        );
      });
    });
  }
};

