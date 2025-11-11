import { CreateTaskPayload } from '../types/tasks/TaskType';

export const validateTask = (task: Partial<CreateTaskPayload>): {
  isValid: boolean;
  fieldErrors: {
    title: string[];
    description: string[];
    due_date: string[];
  };
} => {
  const fieldErrors = {
    title: [] as string[],
    description: [] as string[],
    due_date: [] as string[]
  };

  if (!task.title || task.title.trim().length === 0) {
    fieldErrors.title.push('Title is required');
  } else if (task.title.trim().length < 3) {
    fieldErrors.title.push('Title must be at least 3 characters');
  } else if (task.title.trim().length > 200) {
    fieldErrors.title.push('Title must be less than 200 characters');
  }

  if (task.description && task.description.length > 1000) {
    fieldErrors.description.push('Description must be less than 1000 characters');
  }

  if (task.due_date) {
    const dueDate = new Date(task.due_date);
    const now = new Date();
    
    if (isNaN(dueDate.getTime())) {
      fieldErrors.due_date.push('Invalid date format');
    } else if (dueDate < now) {
      fieldErrors.due_date.push('Due date must be in the future');
    }
  }

  const isValid = 
    fieldErrors.title.length === 0 &&
    fieldErrors.description.length === 0 &&
    fieldErrors.due_date.length === 0;

  return { isValid, fieldErrors };
};

export const validateTaskTitle = (title: string): string[] => {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  } else if (title.trim().length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  return errors;
};

export const validateTaskDescription = (description: string): string[] => {
  const errors: string[] = [];

  if (description && description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  return errors;
};

export const validateDueDate = (dueDate: string | null): string[] => {
  const errors: string[] = [];

  if (dueDate) {
    const date = new Date(dueDate);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    } else if (date < now) {
      errors.push('Due date must be in the future');
    }
  }

  return errors;
};

