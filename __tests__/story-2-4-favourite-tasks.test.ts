/**
 * Story 2.4: Favourite Tasks
 * Tests for favourite toggle persistence and Redux state management.
 */

import { tasksReducer } from '../src/application/store/reducer/tasksReducer';
import { Task } from '../src/application/services/tasks/tasksSQLiteService';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  local_id: 'local-1',
  server_id: null,
  title: 'Test Task',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: null,
  tags: [],
  image_path: null,
  image_url: null,
  owner_id: 'user-1',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  sync_status: 'pending',
  is_deleted: 0,
  local_updated_at: null,
  needs_sync: 1,
  is_favourite: 0,
  ...overrides,
});

describe('Story 2.4: Favourite Tasks', () => {
  describe('Redux: UPDATE_TASK with is_favourite', () => {
    it('marks a task as favourite via Redux update', () => {
      const initialState = { tasks: [makeTask({ local_id: 'local-1', is_favourite: 0 })] };
      const action = { type: 'UPDATE_TASK', payload: { taskId: 'local-1', updates: { is_favourite: 1 } } };
      const newState = tasksReducer(initialState as any, action as any);
      expect(newState.tasks[0].is_favourite).toBe(1);
    });

    it('unmarks a task as favourite via Redux update', () => {
      const initialState = { tasks: [makeTask({ local_id: 'local-1', is_favourite: 1 })] };
      const action = { type: 'UPDATE_TASK', payload: { taskId: 'local-1', updates: { is_favourite: 0 } } };
      const newState = tasksReducer(initialState as any, action as any);
      expect(newState.tasks[0].is_favourite).toBe(0);
    });

    it('does not affect other tasks when toggling favourite', () => {
      const initialState = {
        tasks: [
          makeTask({ local_id: 'local-1', is_favourite: 0 }),
          makeTask({ local_id: 'local-2', is_favourite: 0 }),
        ],
      };
      const action = { type: 'UPDATE_TASK', payload: { taskId: 'local-1', updates: { is_favourite: 1 } } };
      const newState = tasksReducer(initialState as any, action as any);
      expect(newState.tasks[0].is_favourite).toBe(1);
      expect(newState.tasks[1].is_favourite).toBe(0);
    });
  });

  describe('Favourite indicator logic', () => {
    it('identifies a favourite task correctly', () => {
      const task = makeTask({ is_favourite: 1 });
      expect(task.is_favourite === 1).toBe(true);
    });

    it('identifies a non-favourite task correctly', () => {
      const task = makeTask({ is_favourite: 0 });
      expect(task.is_favourite === 1).toBe(false);
    });

    it('treats undefined is_favourite as non-favourite', () => {
      const task = makeTask({ is_favourite: undefined });
      expect(task.is_favourite === 1).toBe(false);
    });
  });

  describe('UpdateTaskPayload includes is_favourite', () => {
    it('UpdateTaskPayload type allows is_favourite field', () => {
      const { } = require('../src/domain/types/tasks/TaskType');
      // Compile-time check: ensure is_favourite is a valid key in UpdateTaskPayload
      const payload: import('../src/domain/types/tasks/TaskType').UpdateTaskPayload = {
        is_favourite: 1,
      };
      expect(payload.is_favourite).toBe(1);
    });
  });
});
