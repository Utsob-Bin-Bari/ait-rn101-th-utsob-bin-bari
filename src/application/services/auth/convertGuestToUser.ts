import { tasksSQLiteService } from '../tasks/tasksSQLiteService';
import { userSessionStorage } from '../../../infrastructure/storage/userSessionStorage';
import { GUEST_USER_ID } from '../../../domain/types/auth';

export const convertGuestToUser = async (userId: string): Promise<{
  success: boolean;
  migratedCount: number;
  error?: string;
}> => {
  try {
    const allTasks = await tasksSQLiteService.getAllTasks(GUEST_USER_ID);
    
    const guestTasks = allTasks.filter(task => task.owner_id === GUEST_USER_ID);
    
    let migratedCount = 0;
    for (const task of guestTasks) {
      await tasksSQLiteService.updateTaskOwner(task.local_id, userId);
      migratedCount++;
    }
    
    return {
      success: true,
      migratedCount,
    };
  } catch (error: any) {
    console.error('Guest to user conversion error:', error);
    
    return {
      success: false,
      migratedCount: 0,
      error: error.message || 'Failed to convert guest data',
    };
  }
};

export const clearGuestData = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const allTasks = await tasksSQLiteService.getAllTasks(GUEST_USER_ID);
    
    const guestTasks = allTasks.filter(task => task.owner_id === GUEST_USER_ID);
    
    for (const task of guestTasks) {
      await tasksSQLiteService.permanentlyDeleteTask(task.local_id);
    }
    
    await userSessionStorage.clear();
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Clear guest data error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to clear guest data',
    };
  }
};

