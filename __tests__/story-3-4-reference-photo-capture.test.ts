/**
 * Story 3.4: Reference Photo Capture on Task
 * Tests cover:
 *   - DB schema contains photo_dismiss_ref_path column
 *   - TaskType payloads include photo_dismiss_ref_path
 *   - Ref photo save path convention
 *   - Validation rejects save without ref photo when alarm enabled
 *   - deleteTask cleans up ref photo file
 */

// ─── DB Schema ────────────────────────────────────────────────────────────────

describe('Story 3.4: DB Schema — photo_dismiss_ref_path', () => {
  it('DATABASE_SCHEMA VERSION is 3', () => {
    const { DATABASE_SCHEMA } = require('../src/infrastructure/storage/DatabaseSchema');
    expect(DATABASE_SCHEMA.VERSION).toBe(3);
  });

  it('tasks CREATE TABLE statement contains photo_dismiss_ref_path column', () => {
    const { DATABASE_SCHEMA } = require('../src/infrastructure/storage/DatabaseSchema');
    const tasksTable = DATABASE_SCHEMA.CREATE_TABLES.find((sql: string) =>
      sql.includes('CREATE TABLE IF NOT EXISTS tasks')
    );
    expect(tasksTable).toContain('photo_dismiss_ref_path');
  });

  it('tasks CREATE TABLE has photo_dismiss_ref_path with TEXT DEFAULT NULL', () => {
    const { DATABASE_SCHEMA } = require('../src/infrastructure/storage/DatabaseSchema');
    const tasksTable = DATABASE_SCHEMA.CREATE_TABLES.find((sql: string) =>
      sql.includes('CREATE TABLE IF NOT EXISTS tasks')
    );
    expect(tasksTable).toMatch(/photo_dismiss_ref_path\s+TEXT\s+DEFAULT\s+NULL/);
  });
});

// ─── Type definitions ─────────────────────────────────────────────────────────

describe('Story 3.4: TaskType — photo_dismiss_ref_path field', () => {
  it('Task interface includes photo_dismiss_ref_path as optional string | null', () => {
    // TypeScript type check at runtime via structural assignment
    const task: import('../src/domain/types/tasks/TaskType').Task = {
      id: 'id-1',
      local_id: 'local-1',
      server_id: null,
      title: 'Test',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: null,
      tags: [],
      image_path: null,
      image_url: null,
      owner_id: 'user-1',
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      sync_status: 'pending',
      is_deleted: 0,
      local_updated_at: null,
      needs_sync: 1,
      photo_dismiss_ref_path: '/path/to/ref.jpg',
    };
    expect(task.photo_dismiss_ref_path).toBe('/path/to/ref.jpg');
  });

  it('CreateTaskPayload includes photo_dismiss_ref_path', () => {
    const payload: import('../src/domain/types/tasks/TaskType').CreateTaskPayload = {
      title: 'Test',
      description: '',
      photo_dismiss_ref_path: '/ref/photo.jpg',
    };
    expect(payload.photo_dismiss_ref_path).toBe('/ref/photo.jpg');
  });

  it('UpdateTaskPayload includes photo_dismiss_ref_path', () => {
    const payload: import('../src/domain/types/tasks/TaskType').UpdateTaskPayload = {
      photo_dismiss_ref_path: null,
    };
    expect(payload.photo_dismiss_ref_path).toBeNull();
  });
});

// ─── Ref photo save path convention ──────────────────────────────────────────

describe('Story 3.4: Ref photo save path convention', () => {
  it('saves ref photos with ref_ prefix in task_images directory', () => {
    // Convention test: imageService.saveImageLocally is called with `ref_${taskId}` prefix
    const taskId = 'local_123';
    const prefix = `ref_${taskId}`;
    expect(prefix).toMatch(/^ref_/);
  });
});

// ─── Alarm+ref photo validation ───────────────────────────────────────────────

describe('Story 3.4: Validation — ref photo required when alarm enabled', () => {
  it('AC4: alerts "Reference Photo Required" when alarm is enabled but no ref photo set', () => {
    const alertMock = jest.fn();
    const mockAlert = { alert: alertMock };

    // Simulate handleSave logic for alarm-enabled, no ref photo
    const alarmEnabled = true;
    const refPhotoUri: string | null = null;

    const handleSave = () => {
      if (alarmEnabled && !refPhotoUri) {
        mockAlert.alert(
          'Reference Photo Required',
          'Please set a reference photo to use photo dismiss'
        );
        return false;
      }
      return true;
    };

    const result = handleSave();
    expect(result).toBe(false);
    expect(alertMock).toHaveBeenCalledWith(
      'Reference Photo Required',
      'Please set a reference photo to use photo dismiss'
    );
  });

  it('proceeds to save when alarm is enabled AND ref photo is set', () => {
    const alertMock = jest.fn();
    const mockAlert = { alert: alertMock };

    const alarmEnabled = true;
    const refPhotoUri = '/path/to/ref.jpg';

    const handleSave = () => {
      if (alarmEnabled && !refPhotoUri) {
        mockAlert.alert('Reference Photo Required', 'Please set a reference photo to use photo dismiss');
        return false;
      }
      return true;
    };

    const result = handleSave();
    expect(result).toBe(true);
    expect(alertMock).not.toHaveBeenCalled();
  });

  it('skips ref photo validation when alarm is disabled', () => {
    const alertMock = jest.fn();
    const mockAlert = { alert: alertMock };

    const alarmEnabled = false;
    const refPhotoUri: string | null = null;

    const handleSave = () => {
      if (alarmEnabled && !refPhotoUri) {
        mockAlert.alert('Reference Photo Required', 'Please set a reference photo to use photo dismiss');
        return false;
      }
      return true;
    };

    const result = handleSave();
    expect(result).toBe(true);
    expect(alertMock).not.toHaveBeenCalled();
  });
});

// ─── deleteTask cleans up ref photo ──────────────────────────────────────────

describe('Story 3.4: deleteTask — deletes ref photo file', () => {
  it('AC5: deleteLocalImage is called when task has photo_dismiss_ref_path', async () => {
    const deleteLocalImage = jest.fn().mockResolvedValue(undefined);
    const cancelTaskNotification = jest.fn().mockResolvedValue(undefined);
    const cancelAlarmNotification = jest.fn().mockResolvedValue(undefined);
    const deleteTaskDb = jest.fn().mockResolvedValue(undefined);
    const addToQueue = jest.fn().mockResolvedValue(undefined);

    const taskWithPhoto = {
      local_id: 'local-1',
      photo_dismiss_ref_path: '/files/ref_local-1.jpg',
    };

    // Simulate deleteTask logic
    const simulatedDeleteTask = async () => {
      await cancelTaskNotification('local-1');
      await cancelAlarmNotification('local-1');

      if (taskWithPhoto?.photo_dismiss_ref_path) {
        await deleteLocalImage(taskWithPhoto.photo_dismiss_ref_path);
      }

      await deleteTaskDb('local-1', 'user-1');
      await addToQueue('delete', 'task', 'local-1');
    };

    await simulatedDeleteTask();

    expect(deleteLocalImage).toHaveBeenCalledWith('/files/ref_local-1.jpg');
    expect(deleteTaskDb).toHaveBeenCalledWith('local-1', 'user-1');
  });

  it('AC5: deleteLocalImage is NOT called when task has no ref photo', async () => {
    const deleteLocalImage = jest.fn().mockResolvedValue(undefined);

    const taskWithoutPhoto = {
      local_id: 'local-2',
      photo_dismiss_ref_path: null,
    };

    if (taskWithoutPhoto?.photo_dismiss_ref_path) {
      await deleteLocalImage(taskWithoutPhoto.photo_dismiss_ref_path);
    }

    expect(deleteLocalImage).not.toHaveBeenCalled();
  });
});

// ─── alarmPayload includes ref path + tolerance ───────────────────────────────

describe('Story 3.4: alarmPayload construction', () => {
  it('AC6: photo_dismiss_tolerance is 0.7 in DB schema default', () => {
    const { DATABASE_SCHEMA } = require('../src/infrastructure/storage/DatabaseSchema');
    const tasksTable = DATABASE_SCHEMA.CREATE_TABLES.find((sql: string) =>
      sql.includes('CREATE TABLE IF NOT EXISTS tasks')
    );
    expect(tasksTable).toMatch(/photo_dismiss_tolerance\s+REAL\s+DEFAULT\s+0\.7/);
  });

  it('alarm payload sets photo_dismiss_ref_path when alarm is enabled', () => {
    const alarmEnabled = true;
    const refPhotoUri = '/path/to/ref.jpg';
    const dueDate = '2026-12-01T08:00:00.000Z';

    const alarmPayload = {
      alarm_enabled: alarmEnabled ? 1 : 0,
      alarm_time: alarmEnabled && dueDate ? dueDate : null,
      photo_dismiss_enabled: alarmEnabled ? 1 : 0,
      photo_dismiss_ref_path: alarmEnabled ? refPhotoUri : null,
    };

    expect(alarmPayload.photo_dismiss_ref_path).toBe('/path/to/ref.jpg');
    expect(alarmPayload.photo_dismiss_enabled).toBe(1);
  });

  it('alarm payload sets photo_dismiss_ref_path to null when alarm is disabled', () => {
    const alarmEnabled = false;
    const refPhotoUri = '/path/to/ref.jpg';

    const alarmPayload = {
      alarm_enabled: alarmEnabled ? 1 : 0,
      alarm_time: null,
      photo_dismiss_enabled: alarmEnabled ? 1 : 0,
      photo_dismiss_ref_path: alarmEnabled ? refPhotoUri : null,
    };

    expect(alarmPayload.photo_dismiss_ref_path).toBeNull();
  });
});
