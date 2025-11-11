import { Task } from './tasksSQLiteService';
import { TaskFilters } from '../../../domain/types/tasks/TaskType';

export const searchFilterService = {
  searchTasks: (
    tasks: Task[],
    searchQuery: string,
    statusFilter: string = 'all',
    tagFilter: string[] = []
  ): Task[] => {
    let filtered = [...tasks];

    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (tagFilter.length > 0) {
      filtered = filtered.filter(task =>
        task.tags.some(tag => tagFilter.includes(tag.toLowerCase()))
      );
    }

    return filtered;
  },

  filterByStatus: (tasks: Task[], status: string): Task[] => {
    if (status === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.status === status);
  },

  filterByTags: (tasks: Task[], tags: string[]): Task[] => {
    if (tags.length === 0) {
      return tasks;
    }
    return tasks.filter(task =>
      task.tags.some(tag => tags.includes(tag.toLowerCase()))
    );
  },

  filterByPriority: (tasks: Task[], priority: string): Task[] => {
    if (priority === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.priority === priority);
  },

  filterByDueDate: (tasks: Task[], filterType: 'overdue' | 'today' | 'week' | 'month'): Task[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return tasks.filter(task => {
      if (!task.due_date) return false;
      
      const dueDate = new Date(task.due_date);
      
      switch (filterType) {
        case 'overdue':
          return dueDate < today;
        case 'today':
          const todayEnd = new Date(today);
          todayEnd.setDate(todayEnd.getDate() + 1);
          return dueDate >= today && dueDate < todayEnd;
        case 'week':
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return dueDate >= today && dueDate < weekEnd;
        case 'month':
          const monthEnd = new Date(today);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          return dueDate >= today && dueDate < monthEnd;
        default:
          return true;
      }
    });
  },

  extractUniqueTags: (tasks: Task[]): string[] => {
    const allTags = tasks.flatMap(task => task.tags);
    const uniqueTags = [...new Set(allTags)].sort();
    return uniqueTags;
  },

  getTaskCounts: (tasks: Task[]): {
    all: number;
    pending: number;
    in_progress: number;
    completed: number;
  } => {
    return {
      all: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };
  },

  sortTasks: (tasks: Task[], sortBy: 'title' | 'created_at' | 'updated_at' | 'due_date' | 'priority', order: 'asc' | 'desc' = 'desc'): Task[] => {
    const sorted = [...tasks].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'created_at':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          compareValue = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          compareValue = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'priority':
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
          compareValue = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        default:
          compareValue = 0;
      }

      return order === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }
};

