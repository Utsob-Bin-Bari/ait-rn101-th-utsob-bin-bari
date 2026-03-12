/**
 * Story 2.2 — Task List with Overdue Indicators
 * Sort order and overdue detection.
 */

import { searchFilterService } from '../src/application/services/tasks/searchFilterService';
import { Task } from '../src/application/services/tasks/tasksSQLiteService';

const baseTask = (overrides: Partial<Task> = {}): Task =>
  ({
    id: 'id1',
    local_id: 'local_1',
    server_id: null,
    title: 'Task',
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

describe('Story 2.2 — Task List with Overdue Indicators', () => {
  describe('AC1 — isOverdue', () => {
    it('returns false when task has no due_date', () => {
      expect(searchFilterService.isOverdue(baseTask({ due_date: null }))).toBe(false);
    });

    it('returns true when due_date is in the past (before today)', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(
        searchFilterService.isOverdue(baseTask({ due_date: yesterday.toISOString() }))
      ).toBe(true);
    });

    it('returns false when due_date is today or future', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      expect(
        searchFilterService.isOverdue(baseTask({ due_date: today.toISOString() }))
      ).toBe(false);
    });
  });

  describe('AC3 — sortTasksWithOverdueFirst', () => {
    it('puts overdue tasks first, then by due_date asc, then no due_date', () => {
      const past1 = new Date();
      past1.setDate(past1.getDate() - 3);
      const past2 = new Date();
      past2.setDate(past2.getDate() - 1);
      const future = new Date();
      future.setDate(future.getDate() + 2);

      const noDue = baseTask({ local_id: 'a', due_date: null });
      const overdue1 = baseTask({ local_id: 'b', due_date: past1.toISOString() });
      const overdue2 = baseTask({ local_id: 'c', due_date: past2.toISOString() });
      const upcoming = baseTask({ local_id: 'd', due_date: future.toISOString() });

      const sorted = searchFilterService.sortTasksWithOverdueFirst([
        upcoming,
        noDue,
        overdue2,
        overdue1,
      ]);

      const ids = sorted.map((t) => t.local_id);
      expect(ids[0]).toBe('b');
      expect(ids[1]).toBe('c');
      expect(ids.indexOf('d')).toBeLessThan(ids.indexOf('a'));
    });
  });
});
