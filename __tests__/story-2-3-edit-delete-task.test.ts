/**
 * Story 2.3 — Edit & Delete Task
 * Reducer and edit/delete flow behaviour.
 */

import { tasksReducer } from '../src/application/store/reducer/tasksReducer';
import { updateTask } from '../src/application/store/action/tasks/updateTask';
import { removeTask } from '../src/application/store/action/tasks/removeTask';
import { Task } from '../src/application/services/tasks/tasksSQLiteService';

const baseTask = (overrides: Partial<Task> = {}): Task =>
  ({
    id: 'id1',
    local_id: 'local_1',
    server_id: null,
    title: 'Original',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: null,
    tags: [],
    image_path: null,
    image_url: null,
    owner_id: 'u1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sync_status: 'pending',
    is_deleted: 0,
    local_updated_at: null,
    needs_sync: 1,
    ...overrides,
  }) as Task;

describe('Story 2.3 — Edit & Delete Task', () => {
  describe('AC1 — Update reflected in list (reducer)', () => {
    it('UPDATE_TASK merges updates into task by local_id', () => {
      const state = {
        tasks: [baseTask({ local_id: 'local_1', title: 'Original' })],
        loading: false,
        error: null,
        syncStatus: { isOnline: false, isSyncing: false, lastSyncAt: null, pendingCount: 0 },
      };
      const next = tasksReducer(state, updateTask('local_1', { title: 'Updated Title', due_date: '2026-03-15T12:00:00.000Z' }));
      expect(next.tasks).toHaveLength(1);
      expect(next.tasks[0].title).toBe('Updated Title');
      expect(next.tasks[0].due_date).toBe('2026-03-15T12:00:00.000Z');
    });
  });

  describe('AC2 — Delete removes from list immediately (reducer)', () => {
    it('REMOVE_TASK removes task by local_id', () => {
      const state = {
        tasks: [
          baseTask({ local_id: 'local_1' }),
          baseTask({ local_id: 'local_2' }),
        ],
        loading: false,
        error: null,
        syncStatus: { isOnline: false, isSyncing: false, lastSyncAt: null, pendingCount: 0 },
      };
      const next = tasksReducer(state, removeTask('local_1'));
      expect(next.tasks).toHaveLength(1);
      expect(next.tasks[0].local_id).toBe('local_2');
    });
  });
});
