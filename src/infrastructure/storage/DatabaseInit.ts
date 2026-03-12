import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { DATABASE_SCHEMA, DatabaseHelpers } from './DatabaseSchema';

SQLite.enablePromise(true);

export class DatabaseInit {
  private static instance: DatabaseInit;
  private db: SQLiteDatabase | null = null;

  private constructor() {}

  public static getInstance(): DatabaseInit {
    if (!DatabaseInit.instance) {
      DatabaseInit.instance = new DatabaseInit();
    }
    return DatabaseInit.instance;
  }

  public async initializeDatabase(): Promise<SQLiteDatabase> {
    try {
      this.db = await SQLite.openDatabase({
        name: 'taskbell.db',
        location: 'default',
      });

      await this.createTables();
      await this.setInitialSettings();
      await this.runMigrations();
      await this.createIndexes();

      return this.db;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const version = await this.getDatabaseVersion();
    if (version >= DATABASE_SCHEMA.VERSION) {
      return;
    }

    if (version < 2) {
      const alterStatements = [
        'ALTER TABLE tasks ADD COLUMN is_favourite INTEGER DEFAULT 0',
        'ALTER TABLE tasks ADD COLUMN alarm_time TEXT DEFAULT NULL',
        'ALTER TABLE tasks ADD COLUMN alarm_enabled INTEGER DEFAULT 0',
        'ALTER TABLE tasks ADD COLUMN photo_dismiss_enabled INTEGER DEFAULT 0',
        'ALTER TABLE tasks ADD COLUMN photo_dismiss_tolerance REAL DEFAULT 0.7',
      ];
      for (const sql of alterStatements) {
        await this.db.executeSql(sql);
      }
      await this.db.executeSql('CREATE INDEX IF NOT EXISTS idx_tasks_alarm_time ON tasks(alarm_time)');
      await this.db.executeSql('CREATE INDEX IF NOT EXISTS idx_tasks_is_favourite ON tasks(is_favourite)');
      await this.setDatabaseVersion(2);
    }
  }

  private async getDatabaseVersion(): Promise<number> {
    if (!this.db) return 0;
    const [result] = await this.db.executeSql(
      "SELECT value FROM app_settings WHERE key = 'database_version' LIMIT 1"
    );
    if (result.rows.length === 0) return 0;
    const value = result.rows.item(0).value;
    const v = parseInt(value, 10);
    return isNaN(v) ? 0 : v;
  }

  private async setDatabaseVersion(version: number): Promise<void> {
    if (!this.db) return;
    const currentTimestamp = DatabaseHelpers.getCurrentTimestamp();
    await this.db.executeSql(
      `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('database_version', ?, ?)`,
      [version.toString(), currentTimestamp]
    );
  }

  public getDatabase(): SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return this.db;
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const createTableSQL of DATABASE_SCHEMA.CREATE_TABLES) {
      await this.db.executeSql(createTableSQL);
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const createIndexSQL of DATABASE_SCHEMA.CREATE_INDEXES) {
      await this.db.executeSql(createIndexSQL);
    }
  }

  private async setInitialSettings(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const currentTimestamp = DatabaseHelpers.getCurrentTimestamp();
    
    const initialSettings = [
      ['app_version', '1.0.0'],
      ['database_version', DATABASE_SCHEMA.VERSION.toString()],
      ['last_full_sync', ''],
      ['sync_enabled', 'true'],
      ['offline_mode', 'false']
    ];

    for (const [key, value] of initialSettings) {
      await this.db.executeSql(
        `INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)`,
        [key, value, currentTimestamp]
      );
    }
  }

  public async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const clearTables = [
      'DELETE FROM user_session',
      'DELETE FROM tasks',
      'DELETE FROM sync_queue',
      'DELETE FROM app_settings WHERE key NOT IN ("app_version", "database_version")'
    ];

    for (const clearSQL of clearTables) {
      await this.db.executeSql(clearSQL);
    }
  }

  public async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  public async checkDatabaseHealth(): Promise<boolean> {
    try {
      if (!this.db) return false;

      await this.db.executeSql('SELECT COUNT(*) FROM user_session');
      await this.db.executeSql('SELECT COUNT(*) FROM tasks');
      await this.db.executeSql('SELECT COUNT(*) FROM sync_queue');
      await this.db.executeSql('SELECT COUNT(*) FROM app_settings');

      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

