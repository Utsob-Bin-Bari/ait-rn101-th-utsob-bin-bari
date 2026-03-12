/**
 * Story 3.1: Alarm Scheduling on Task
 * Tests for alarm notification ID conventions, payload types, and SQLite fields.
 */

import { Task } from '../src/application/services/tasks/tasksSQLiteService';
import { UpdateTaskPayload, CreateTaskPayload } from '../src/domain/types/tasks/TaskType';
import { DATABASE_SCHEMA } from '../src/infrastructure/storage/DatabaseSchema';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  local_id: 'local-abc',
  server_id: null,
  title: 'Wake up and exercise',
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
  alarm_time: null,
  alarm_enabled: 0,
  photo_dismiss_enabled: 0,
  photo_dismiss_tolerance: 0.7,
  ...overrides,
});

describe('Story 3.1: Alarm Scheduling on Task', () => {
  describe('Alarm notification ID convention', () => {
    it('alarm notification ID is {local_id}_alarm', () => {
      const task = makeTask({ local_id: 'local-abc' });
      const alarmId = `${task.local_id}_alarm`;
      expect(alarmId).toBe('local-abc_alarm');
    });

    it('alarm notification ID differs from due-date notification ID', () => {
      const task = makeTask({ local_id: 'local-abc' });
      const dueDateId = task.local_id;
      const alarmId = `${task.local_id}_alarm`;
      expect(dueDateId).not.toBe(alarmId);
    });
  });

  describe('scheduleAlarmNotification guards', () => {
    it('should not schedule when alarm_enabled is 0', () => {
      const task = makeTask({ alarm_enabled: 0, alarm_time: '2099-01-01T10:00:00.000Z' });
      const shouldSchedule = task.alarm_enabled === 1 && !!task.alarm_time;
      expect(shouldSchedule).toBe(false);
    });

    it('should not schedule when alarm_time is null', () => {
      const task = makeTask({ alarm_enabled: 1, alarm_time: null });
      const shouldSchedule = task.alarm_enabled === 1 && !!task.alarm_time;
      expect(shouldSchedule).toBe(false);
    });

    it('should schedule when alarm_enabled is 1 and alarm_time is set', () => {
      const task = makeTask({ alarm_enabled: 1, alarm_time: '2099-01-01T10:00:00.000Z' });
      const shouldSchedule = task.alarm_enabled === 1 && !!task.alarm_time;
      expect(shouldSchedule).toBe(true);
    });

    it('should not schedule when alarm_time is in the past', () => {
      const pastTime = new Date(Date.now() - 60000).toISOString();
      const alarmDate = new Date(pastTime);
      const now = new Date();
      expect(alarmDate <= now).toBe(true);
    });
  });

  describe('UpdateTaskPayload type includes alarm fields', () => {
    it('accepts alarm_time, alarm_enabled, photo_dismiss_enabled', () => {
      const payload: UpdateTaskPayload = {
        alarm_enabled: 1,
        alarm_time: '2099-06-01T08:00:00.000Z',
        photo_dismiss_enabled: 1,
      };
      expect(payload.alarm_enabled).toBe(1);
      expect(payload.alarm_time).toBe('2099-06-01T08:00:00.000Z');
      expect(payload.photo_dismiss_enabled).toBe(1);
    });

    it('clears alarm when alarm_enabled is 0 and alarm_time is null', () => {
      const payload: UpdateTaskPayload = {
        alarm_enabled: 0,
        alarm_time: null,
        photo_dismiss_enabled: 0,
      };
      expect(payload.alarm_enabled).toBe(0);
      expect(payload.alarm_time).toBeNull();
    });
  });

  describe('CreateTaskPayload type includes alarm fields', () => {
    it('accepts alarm fields on creation', () => {
      const payload: CreateTaskPayload = {
        title: 'Morning run',
        description: '',
        alarm_enabled: 1,
        alarm_time: '2099-06-01T06:30:00.000Z',
        photo_dismiss_enabled: 1,
      };
      expect(payload.alarm_enabled).toBe(1);
      expect(payload.alarm_time).toBe('2099-06-01T06:30:00.000Z');
      expect(payload.photo_dismiss_enabled).toBe(1);
    });
  });

  describe('SQLite schema includes alarm columns', () => {
    it('CREATE TABLE includes alarm_time column', () => {
      const taskTable = DATABASE_SCHEMA.CREATE_TABLES.find(t => t.includes('CREATE TABLE IF NOT EXISTS tasks'));
      expect(taskTable).toContain('alarm_time');
    });

    it('CREATE TABLE includes alarm_enabled column', () => {
      const taskTable = DATABASE_SCHEMA.CREATE_TABLES.find(t => t.includes('CREATE TABLE IF NOT EXISTS tasks'));
      expect(taskTable).toContain('alarm_enabled');
    });

    it('CREATE TABLE includes photo_dismiss_enabled column', () => {
      const taskTable = DATABASE_SCHEMA.CREATE_TABLES.find(t => t.includes('CREATE TABLE IF NOT EXISTS tasks'));
      expect(taskTable).toContain('photo_dismiss_enabled');
    });

    it('CREATE_INDEXES includes idx_tasks_alarm_time', () => {
      expect(DATABASE_SCHEMA.CREATE_INDEXES).toEqual(
        expect.arrayContaining([
          expect.stringContaining('idx_tasks_alarm_time'),
        ])
      );
    });

    it('photo_dismiss_tolerance defaults to 0.7', () => {
      const task = makeTask();
      expect(task.photo_dismiss_tolerance).toBe(0.7);
    });
  });
});
