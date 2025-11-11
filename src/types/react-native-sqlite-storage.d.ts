declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    executeSql(
      statement: string,
      params?: any[],
    ): Promise<[{ rows: { length: number; item: (index: number) => any } }]>;
    close(): Promise<void>;
  }

  export interface SQLite {
    openDatabase(
      config: {
        name: string;
        location: string;
      }
    ): Promise<SQLiteDatabase>;
    enablePromise(enable: boolean): void;
  }

  const SQLite: SQLite;
  export default SQLite;
}

