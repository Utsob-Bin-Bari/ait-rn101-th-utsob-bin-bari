import { DatabaseInit } from './DatabaseInit';
import { DatabaseHelpers } from './DatabaseSchema';

export const userSessionStorage = {
  store: async (userData: {
    id: string;
    email: string;
    name: string;
    accessToken: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const dbInit = DatabaseInit.getInstance();
      const db = dbInit.getDatabase();
      const currentTime = DatabaseHelpers.getCurrentTimestamp();
      
      await db.executeSql(
        `INSERT OR REPLACE INTO user_session 
         (id, user_id, email, name, access_token, created_at, updated_at) 
         VALUES (1, ?, ?, ?, ?, ?, ?)`,
        [userData.id, userData.email, userData.name, userData.accessToken, currentTime, currentTime]
      );

      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to store user session locally';
      if (error.message) {
        errorMessage = `Failed to store user session: ${error.message}`;
      }
      console.error('Store session error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  clear: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const dbInit = DatabaseInit.getInstance();
      const db = dbInit.getDatabase();
      
      await db.executeSql('DELETE FROM user_session');
      await db.executeSql('DELETE FROM sync_queue WHERE entity_type = ?', ['user']);
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to clear user session locally';
      if (error.message) {
        errorMessage = `Failed to clear user session: ${error.message}`;
      }
      console.error('Clear session error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  get: async (): Promise<{
    success: boolean;
    data?: {
      id: string;
      email: string;
      name: string;
      accessToken: string;
    };
    error?: string;
  }> => {
    try {
      const dbInit = DatabaseInit.getInstance();
      const db = dbInit.getDatabase();
      
      const result = await db.executeSql(
        'SELECT user_id, email, name, access_token FROM user_session WHERE id = 1 LIMIT 1'
      );
      
      if (result[0].rows.length > 0) {
        const row = result[0].rows.item(0);
        
        return {
          success: true,
          data: {
            id: row.user_id,
            email: row.email,
            name: row.name,
            accessToken: row.access_token
          }
        };
      } else {
        return {
          success: true,
          data: undefined
        };
      }
    } catch (error: any) {
      let errorMessage = 'Failed to get user session locally';
      if (error.message) {
        errorMessage = `Failed to get user session: ${error.message}`;
      }
      console.error('Get session error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

