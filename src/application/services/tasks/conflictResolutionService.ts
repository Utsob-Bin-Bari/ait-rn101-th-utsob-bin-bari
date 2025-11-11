import DiffMatchPatch from 'diff-match-patch';
import { Task } from './tasksSQLiteService';

const dmp = new DiffMatchPatch();

export const conflictResolutionService = {
  resolveConflict: (
    localTask: Task,
    serverTask: Task,
    strategy: 'last-write-wins' | 'merge' = 'last-write-wins'
  ): Task => {
    if (strategy === 'last-write-wins') {
      const localUpdated = new Date(localTask.updated_at).getTime();
      const serverUpdated = new Date(serverTask.updated_at).getTime();
      
      if (localUpdated > serverUpdated) {
        return localTask;
      } else {
        return serverTask;
      }
    }

    return conflictResolutionService.mergeTask(localTask, serverTask);
  },

  mergeTask: (localTask: Task, serverTask: Task): Task => {
    const baseTitle = localTask.title;
    const baseDescription = localTask.description;

    const mergedTitle = conflictResolutionService.mergeText(
      localTask.title,
      serverTask.title,
      baseTitle
    );

    const mergedDescription = conflictResolutionService.mergeText(
      localTask.description,
      serverTask.description,
      baseDescription
    );

    return {
      ...serverTask,
      title: mergedTitle,
      description: mergedDescription,
      tags: conflictResolutionService.mergeTags(localTask.tags, serverTask.tags),
      local_id: localTask.local_id,
      updated_at: new Date().toISOString()
    };
  },

  mergeText: (local: string, server: string, base: string): string => {
    if (local === server) {
      return local;
    }

    if (local === base) {
      return server;
    }

    if (server === base) {
      return local;
    }

    try {
      const patches1 = dmp.patch_make(base, local);
      const patches2 = dmp.patch_make(base, server);
      
      const allPatches = [...patches1, ...patches2];
      const [mergedText] = dmp.patch_apply(allPatches, base);
      
      return mergedText;
    } catch (error) {
      console.error('Error merging text:', error);
      return local;
    }
  },

  mergeTags: (localTags: string[], serverTags: string[]): string[] => {
    const allTags = [...localTags, ...serverTags];
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  },

  detectConflict: (localTask: Task, serverTask: Task): boolean => {
    if (!localTask.local_updated_at || !serverTask.updated_at) {
      return false;
    }

    const localUpdated = new Date(localTask.local_updated_at).getTime();
    const serverUpdated = new Date(serverTask.updated_at).getTime();

    return (
      localTask.title !== serverTask.title ||
      localTask.description !== serverTask.description ||
      localTask.status !== serverTask.status
    ) && Math.abs(localUpdated - serverUpdated) < 60000;
  },

  getConflictSummary: (localTask: Task, serverTask: Task): {
    hasConflict: boolean;
    fields: string[];
  } => {
    const fields: string[] = [];

    if (localTask.title !== serverTask.title) {
      fields.push('title');
    }
    if (localTask.description !== serverTask.description) {
      fields.push('description');
    }
    if (localTask.status !== serverTask.status) {
      fields.push('status');
    }
    if (localTask.priority !== serverTask.priority) {
      fields.push('priority');
    }
    if (localTask.due_date !== serverTask.due_date) {
      fields.push('due_date');
    }

    return {
      hasConflict: fields.length > 0,
      fields
    };
  }
};

