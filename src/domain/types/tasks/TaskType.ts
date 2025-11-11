export interface Task {
  id: string;
  local_id: string;
  server_id: string | null;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  tags: string[];
  image_path: string | null;
  image_url: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  sync_status: 'synced' | 'pending' | 'conflict';
  is_deleted: number;
  local_updated_at: string | null;
  needs_sync: number;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
  tags?: string[];
  image_path?: string | null;
  image_url?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
  tags?: string[];
  image_path?: string | null;
  image_url?: string | null;
}

export interface TaskFilters {
  status?: 'all' | 'pending' | 'in_progress' | 'completed';
  tags?: string[];
  searchQuery?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

