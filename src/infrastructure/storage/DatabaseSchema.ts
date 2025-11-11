export const DATABASE_SCHEMA = {
  VERSION: 1,
  
  CREATE_TABLES: [
    
    `CREATE TABLE IF NOT EXISTS user_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      access_token TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_sync_at TEXT DEFAULT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS tasks (
      local_id TEXT PRIMARY KEY,
      server_id TEXT UNIQUE DEFAULT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date TEXT DEFAULT NULL,
      tags TEXT DEFAULT '[]',
      image_path TEXT DEFAULT NULL,
      image_url TEXT DEFAULT NULL,
      owner_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT DEFAULT 'pending',
      is_deleted INTEGER DEFAULT 0,
      local_updated_at TEXT DEFAULT NULL,
      needs_sync INTEGER DEFAULT 1
    )`,

    `CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload TEXT DEFAULT NULL,
      created_at TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      status TEXT DEFAULT 'pending'
    )`,

    `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  ],

  CREATE_INDEXES: [
    `CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tasks(owner_id)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_server_id ON tasks(server_id)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_sync_status ON tasks(sync_status)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_needs_sync ON tasks(needs_sync)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`,
    `CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status)`,
    `CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id)`
  ]
};

export const DatabaseHelpers = {
  parseJsonArray: (jsonString: string | null): string[] => {
    if (!jsonString || jsonString === '[]') return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  },

  arrayToJson: (array: string[]): string => {
    return JSON.stringify(array || []);
  },

  generateLocalId: (): string => {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  getCurrentTimestamp: (): string => {
    return new Date().toISOString();
  }
};

export const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING: 'pending',
  CONFLICT: 'conflict'
} as const;

export const OPERATION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
} as const;

export const ENTITY_TYPES = {
  TASK: 'task',
  USER: 'user'
} as const;

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

