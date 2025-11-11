declare module 'react-native-sqlite-storage' {
  export interface Transaction {
    executeSql(
      statement: string,
      params?: any[],
      successCallback?: (transaction: Transaction, resultSet: ResultSet) => void,
      errorCallback?: (transaction: Transaction, error: Error) => boolean
    ): void;
  }

  export interface ResultSet {
    insertId?: number;
    rowsAffected: number;
    rows: {
      length: number;
      item: (index: number) => any;
      raw: () => any[];
    };
  }

  export interface SQLiteDatabase {
    executeSql(
      statement: string,
      params?: any[],
    ): Promise<[{ rows: { length: number; item: (index: number) => any } }]>;
    transaction(
      callback: (transaction: Transaction) => void,
      errorCallback?: (error: Error) => void,
      successCallback?: () => void
    ): void;
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

