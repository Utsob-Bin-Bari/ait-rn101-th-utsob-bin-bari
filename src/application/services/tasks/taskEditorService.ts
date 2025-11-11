import { CreateTaskPayload, UpdateTaskPayload } from '../../../domain/types/tasks/TaskType';
import { validateTask } from '../../../domain/validators/taskValidator';
import { DatabaseHelpers } from '../../../infrastructure/storage/DatabaseSchema';

export const taskEditorService = {
  validateTask: (task: Partial<CreateTaskPayload>) => {
    return validateTask(task);
  },

  prepareTaskForSave: (task: Partial<CreateTaskPayload>, userId: string): CreateTaskPayload => {
    const timestamp = DatabaseHelpers.getCurrentTimestamp();

    return {
      title: (task.title || '').trim(),
      description: (task.description || '').trim(),
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      due_date: task.due_date || null,
      tags: task.tags || [],
      image_path: task.image_path || null,
      image_url: task.image_url || null
    };
  },

  prepareTaskForUpdate: (updates: Partial<UpdateTaskPayload>): UpdateTaskPayload => {
    const cleanUpdates: UpdateTaskPayload = {};

    if (updates.title !== undefined) {
      cleanUpdates.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      cleanUpdates.description = updates.description.trim();
    }
    if (updates.status !== undefined) {
      cleanUpdates.status = updates.status;
    }
    if (updates.priority !== undefined) {
      cleanUpdates.priority = updates.priority;
    }
    if (updates.due_date !== undefined) {
      cleanUpdates.due_date = updates.due_date;
    }
    if (updates.tags !== undefined) {
      cleanUpdates.tags = updates.tags;
    }
    if (updates.image_path !== undefined) {
      cleanUpdates.image_path = updates.image_path;
    }
    if (updates.image_url !== undefined) {
      cleanUpdates.image_url = updates.image_url;
    }

    return cleanUpdates;
  },

  prepareTaskForSync: (task: any): any => {
    return {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      tags: task.tags,
      image_url: task.image_url
    };
  },

  sanitizeTags: (tags: string[]): string[] => {
    return tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, self) => self.indexOf(tag) === index);
  },

  parseTagsInput: (input: string): string[] => {
    return input
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, self) => self.indexOf(tag) === index);
  }
};

