import { DatabaseInit, DatabaseHelpers } from '../../../infrastructure/storage';
import { ENTITY_TYPES, OPERATION_TYPES } from '../../../infrastructure/storage/DatabaseSchema';
import { Task } from '../../../domain/types/tasks/TaskType';

interface LocalTask {
  local_id: string;
  server_id: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  tags: string;
  image_path: string | null;
  image_url: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  sync_status: string;
  is_deleted: number;
  local_updated_at: string | null;
  needs_sync: number;
}

export type { Task };

const createDatabaseQueue = () => {
  let queue: Array<() => Promise<any>> = [];
  let isProcessing = false;

  const processNext = async () => {
    if (isProcessing || queue.length === 0) {
      return;
    }

    isProcessing = true;
    const operation = queue.shift()!;
    
    try {
      await operation();
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
    } finally {
      isProcessing = false;
      processNext();
    }
  };

  const add = async <T>(operation: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      processNext();
    });
  };

  return { add };
};

const dbQueue = createDatabaseQueue();

const transformDbTaskToTask = (dbTask: LocalTask): Task => {
  return {
    id: dbTask.server_id || dbTask.local_id,
    local_id: dbTask.local_id,
    server_id: dbTask.server_id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status as 'pending' | 'in_progress' | 'completed',
    priority: dbTask.priority as 'low' | 'medium' | 'high',
    due_date: dbTask.due_date,
    tags: DatabaseHelpers.parseJsonArray(dbTask.tags),
    image_path: dbTask.image_path,
    image_url: dbTask.image_url,
    owner_id: dbTask.owner_id,
    created_at: dbTask.created_at,
    updated_at: dbTask.updated_at,
    sync_status: dbTask.sync_status as 'synced' | 'pending' | 'conflict',
    is_deleted: dbTask.is_deleted,
    local_updated_at: dbTask.local_updated_at,
    needs_sync: dbTask.needs_sync
  };
};

export const tasksSQLiteService = {
  getAllTasks: async (userId: string): Promise<Task[]> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `SELECT * FROM tasks 
             WHERE owner_id = ? AND is_deleted = 0 
             ORDER BY created_at DESC`,
            [userId],
            (_, result) => {
              const tasks: Task[] = [];
              for (let i = 0; i < result.rows.length; i++) {
                const dbTask = result.rows.item(i) as LocalTask;
                tasks.push(transformDbTaskToTask(dbTask));
              }
              resolve(tasks);
            },
            (_, error) => {
              console.error('Error fetching tasks:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  },

  getTaskById: async (taskId: string): Promise<Task | null> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `SELECT * FROM tasks 
             WHERE (local_id = ? OR server_id = ?) AND is_deleted = 0`,
            [taskId, taskId],
            (_, result) => {
              if (result.rows.length > 0) {
                const dbTask = result.rows.item(0) as LocalTask;
                resolve(transformDbTaskToTask(dbTask));
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              console.error('Error fetching task by id:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  },

  createTask: async (task: Partial<Task>, userId: string): Promise<string> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();
      const localId = DatabaseHelpers.generateLocalId();
      const timestamp = DatabaseHelpers.getCurrentTimestamp();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `INSERT INTO tasks (
              local_id, title, description, status, priority, 
              due_date, tags, image_path, image_url, owner_id, 
              created_at, updated_at, sync_status, needs_sync
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              localId,
              task.title || '',
              task.description || '',
              task.status || 'pending',
              task.priority || 'medium',
              task.due_date || null,
              DatabaseHelpers.arrayToJson(task.tags || []),
              task.image_path || null,
              task.image_url || null,
              userId,
              timestamp,
              timestamp,
              'pending',
              1
            ],
            (_, result) => {
              resolve(localId);
            },
            (_, error) => {
              console.error('Error creating task:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  },

  updateTask: async (taskId: string, task: Partial<Task>, userId: string): Promise<void> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();
      const timestamp = DatabaseHelpers.getCurrentTimestamp();

      const updateOperation = async (attempt: number): Promise<void> => {
        return new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              `SELECT local_id FROM tasks 
               WHERE (local_id = ? OR server_id = ?) AND owner_id = ?`,
              [taskId, taskId, userId],
              (_, result) => {
                if (result.rows.length === 0) {
                  reject(new Error('RETRY_NEEDED'));
                  return;
                }

                const updates: string[] = [];
                const values: any[] = [];

                if (task.title !== undefined) {
                  updates.push('title = ?');
                  values.push(task.title);
                }
                if (task.description !== undefined) {
                  updates.push('description = ?');
                  values.push(task.description);
                }
                if (task.status !== undefined) {
                  updates.push('status = ?');
                  values.push(task.status);
                }
                if (task.priority !== undefined) {
                  updates.push('priority = ?');
                  values.push(task.priority);
                }
                if (task.due_date !== undefined) {
                  updates.push('due_date = ?');
                  values.push(task.due_date);
                }
                if (task.tags !== undefined) {
                  updates.push('tags = ?');
                  values.push(DatabaseHelpers.arrayToJson(task.tags));
                }
                if (task.image_path !== undefined) {
                  updates.push('image_path = ?');
                  values.push(task.image_path);
                }
                if (task.image_url !== undefined) {
                  updates.push('image_url = ?');
                  values.push(task.image_url);
                }
                if (task.server_id !== undefined) {
                  updates.push('server_id = ?');
                  values.push(task.server_id);
                }

                updates.push('updated_at = ?');
                values.push(timestamp);
                updates.push('local_updated_at = ?');
                values.push(timestamp);
                updates.push('needs_sync = ?');
                values.push(1);

                values.push(taskId);
                values.push(taskId);
                values.push(userId);

                tx.executeSql(
                  `UPDATE tasks SET ${updates.join(', ')} 
                   WHERE (local_id = ? OR server_id = ?) AND owner_id = ?`,
                  values,
                  (_, result) => {
                    resolve();
                  },
                  (_, error) => {
                    console.error('Error updating task:', error);
                    reject(error);
                    return false;
                  }
                );
              },
              (_, error) => {
                console.error('Error checking task existence:', error);
                reject(error);
                return false;
              }
            );
          });
        });
      };

      for (let attempt = 0; attempt <= 3; attempt++) {
        try {
          await updateOperation(attempt);
          await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
          return;
        } catch (error: any) {
          if (error.message === 'RETRY_NEEDED' && attempt < 3) {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 200 * (attempt + 1)));
            continue;
          } else {
            throw error;
          }
        }
      }
    });
  },

  deleteTask: async (taskId: string, userId: string): Promise<void> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();
      const timestamp = DatabaseHelpers.getCurrentTimestamp();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE tasks 
             SET is_deleted = 1, updated_at = ?, local_updated_at = ?, needs_sync = 1 
             WHERE (local_id = ? OR server_id = ?) AND owner_id = ?`,
            [timestamp, timestamp, taskId, taskId, userId],
            (_, result) => {
              resolve();
            },
            (_, error) => {
              console.error('Error deleting task:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  },

  permanentlyDeleteTask: async (taskId: string): Promise<void> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `DELETE FROM tasks WHERE local_id = ? OR server_id = ?`,
            [taskId, taskId],
            (_, result) => {
              resolve();
            },
            (_, error) => {
              console.error('Error permanently deleting task:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  },

  updateTaskServerId: async (localId: string, serverId: string): Promise<void> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE tasks SET server_id = ?, sync_status = 'synced', needs_sync = 0 
             WHERE local_id = ?`,
            [serverId, localId],
            (_, result) => {
              resolve();
            },
            (_, error) => {
              console.error('Error updating task server_id:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  },

  markTaskAsSynced: async (taskId: string): Promise<void> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE tasks SET sync_status = 'synced', needs_sync = 0 
             WHERE local_id = ? OR server_id = ?`,
            [taskId, taskId],
            (_, result) => {
              resolve();
            },
            (_, error) => {
              console.error('Error marking task as synced:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  },

  getTasksNeedingSync: async (userId: string): Promise<Task[]> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `SELECT * FROM tasks 
             WHERE owner_id = ? AND needs_sync = 1 
             ORDER BY created_at ASC`,
            [userId],
            (_, result) => {
              const tasks: Task[] = [];
              for (let i = 0; i < result.rows.length; i++) {
                const dbTask = result.rows.item(i) as LocalTask;
                tasks.push(transformDbTaskToTask(dbTask));
              }
              resolve(tasks);
            },
            (_, error) => {
              console.error('Error fetching tasks needing sync:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  },

  bulkInsertTasks: async (tasks: Task[], userId: string): Promise<void> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tasks.forEach(task => {
            tx.executeSql(
              `INSERT OR REPLACE INTO tasks (
                local_id, server_id, title, description, status, priority,
                due_date, tags, image_path, image_url, owner_id,
                created_at, updated_at, sync_status, needs_sync, is_deleted
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                task.local_id || DatabaseHelpers.generateLocalId(),
                task.server_id || task.id,
                task.title,
                task.description,
                task.status,
                task.priority,
                task.due_date,
                DatabaseHelpers.arrayToJson(task.tags),
                task.image_path,
                task.image_url,
                userId,
                task.created_at,
                task.updated_at,
                'synced',
                0,
                0
              ]
            );
          });
        }, (error) => {
          console.error('Error bulk inserting tasks:', error);
          reject(error);
        }, () => {
          resolve();
        });
      });
    });
  },

  updateTaskOwner: async (localId: string, newOwnerId: string): Promise<void> => {
    return dbQueue.add(async () => {
      const db = DatabaseInit.getInstance().getDatabase();

      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE tasks SET owner_id = ?, needs_sync = 1 WHERE local_id = ?`,
            [newOwnerId, localId],
            () => {
              resolve();
            },
            (_, error) => {
              console.error('Error updating task owner:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  }
};

