/**
 * Story 2.1 — Create Task with Title & Due Date
 * Validation and schema migration checks.
 */

import { validateTask } from '../src/domain/validators/taskValidator';
import { DATABASE_SCHEMA } from '../src/infrastructure/storage/DatabaseSchema';

describe('Story 2.1 — Create Task with Title & Due Date', () => {
  describe('AC3 — Title validation', () => {
    it('rejects empty title', () => {
      const result = validateTask({ title: '', description: '' });
      expect(result.isValid).toBe(false);
      expect(result.fieldErrors.title).toContain('Title is required');
    });

    it('rejects whitespace-only title', () => {
      const result = validateTask({ title: '   ', description: '' });
      expect(result.isValid).toBe(false);
      expect(result.fieldErrors.title.length).toBeGreaterThan(0);
    });

    it('accepts valid title (min 3 chars)', () => {
      const result = validateTask({ title: 'Do something', description: '' });
      expect(result.isValid).toBe(true);
      expect(result.fieldErrors.title).toHaveLength(0);
    });
  });

  describe('AC4 — Database schema VERSION 2', () => {
    it('DATABASE_SCHEMA.VERSION is 2', () => {
      expect(DATABASE_SCHEMA.VERSION).toBe(2);
    });

    it('tasks CREATE TABLE includes migration columns', () => {
      const createTasks = DATABASE_SCHEMA.CREATE_TABLES.find((s) =>
        s.includes('CREATE TABLE') && s.includes('tasks')
      );
      expect(createTasks).toBeDefined();
      expect(createTasks).toContain('is_favourite');
      expect(createTasks).toContain('alarm_time');
      expect(createTasks).toContain('alarm_enabled');
      expect(createTasks).toContain('photo_dismiss_enabled');
      expect(createTasks).toContain('photo_dismiss_tolerance');
    });

    it('CREATE_INDEXES includes alarm and favourite indexes', () => {
      const indexes = DATABASE_SCHEMA.CREATE_INDEXES.join(' ');
      expect(indexes).toContain('idx_tasks_alarm_time');
      expect(indexes).toContain('idx_tasks_is_favourite');
    });
  });
});
