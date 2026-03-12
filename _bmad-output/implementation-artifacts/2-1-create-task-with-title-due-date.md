# Story 2.1: Create Task with Title & Due Date

Status: review

## Story

As a **user**,
I want **to create a task with a title and optional due date**,
so that **I can capture what I need to do and when**.

## Acceptance Criteria

**AC1 — Save task to SQLite and show in list**
- Given the user is on the task creation screen
- When they enter a title and tap Save
- Then the task is saved to SQLite and appears in the task list immediately (optimistic update)
- And the task persists after the app is closed and reopened

**AC2 — Due date stored and displayed**
- Given the user sets a due date on the task
- When the task is saved
- Then the due date is stored and displayed on the task card in the list

**AC3 — Title validation**
- Given the user submits a task with no title
- When they tap Save
- Then a validation error is shown and the task is not saved

**AC4 — Database migration**
- Given the app is opened on a device with an existing VERSION 1 database (or on a fresh install)
- When the app initialises
- Then `DatabaseInit.runMigrations()` adds the 5 new columns (`is_favourite`, `alarm_time`, `alarm_enabled`, `photo_dismiss_enabled`, `photo_dismiss_tolerance`) with correct defaults and bumps the schema to VERSION 2 without data loss

## Tasks / Subtasks

- [x] **Task 1: Schema migration VERSION 1 → 2** (AC4)
  - [x] In `DatabaseSchema.ts`: bump `VERSION` to 2; add 5 columns to `CREATE TABLE tasks` for new installs; add indexes `idx_tasks_alarm_time`, `idx_tasks_is_favourite`
  - [x] In `DatabaseInit.ts`: add `runMigrations()` that reads `database_version` from `app_settings`; if < 2, run `ALTER TABLE tasks ADD COLUMN` for each of the 5 columns with correct defaults; create the 2 new indexes; update `database_version` to 2 in `app_settings`
  - [x] Call `runMigrations()` from `initializeDatabase()` after `createTables()` and `setInitialSettings()`, before `createIndexes()`

- [x] **Task 2: Task type and create flow** (AC1, AC2, AC3)
  - [x] Ensure `Task` type includes the 5 new fields (for reads). Ensure title validation (no empty title) is in place and blocks save
  - [x] Verify create flow: `CreateTaskScreen` → `useTaskEditor` → `tasksService.createTask` → SQLite + `dispatch(addTask)` so task appears immediately and persists

- [x] **Task 3: Tests** (AC1–AC4)
  - [x] Add or run tests for: migration runs and version bumps; create task validation (empty title fails); task persists

## Dev Notes

- Architecture: migration uses `ALTER TABLE` only; no DROP/recreate. New installs get full schema from `CREATE_TABLES`.
- Title validation: `taskValidator` already requires non-empty title and min 3 chars — satisfies AC3.
- Create flow exists: `tasksSQLiteService.createTask`, `tasksService.createTask`, `addTask` dispatch. Confirm due_date is stored and shown on cards.

## Dev Agent Record

- **DatabaseSchema.ts:** VERSION set to 2; tasks table in CREATE_TABLES extended with is_favourite, alarm_time, alarm_enabled, photo_dismiss_enabled, photo_dismiss_tolerance; CREATE_INDEXES extended with idx_tasks_alarm_time, idx_tasks_is_favourite.
- **DatabaseInit.ts:** runMigrations() added: reads database_version from app_settings; if < 2 runs 5 ALTER TABLE ADD COLUMN and 2 CREATE INDEX, then setDatabaseVersion(2). getDatabaseVersion() and setDatabaseVersion() added. initializeDatabase() order: createTables → setInitialSettings → runMigrations → createIndexes.
- **TaskType.ts:** Task interface extended with optional is_favourite, alarm_time, alarm_enabled, photo_dismiss_enabled, photo_dismiss_tolerance.
- **tasksSQLiteService.ts:** LocalTask and transformDbTaskToTask updated to map the 5 new columns. Create flow and title validation (taskValidator) already in place; no code change required for AC1–AC3.
- **Tests:** __tests__/story-2-1-create-task.test.ts — title validation (empty/whitespace rejected, valid accepted), schema VERSION 2, migration columns and indexes present. Full suite 46 tests pass.

## File List

- `src/infrastructure/storage/DatabaseSchema.ts` (modified)
- `src/infrastructure/storage/DatabaseInit.ts` (modified)
- `src/domain/types/tasks/TaskType.ts` (modified)
- `src/application/services/tasks/tasksSQLiteService.ts` (modified)
- `_bmad-output/implementation-artifacts/2-1-create-task-with-title-due-date.md` (created, updated)
- `__tests__/story-2-1-create-task.test.ts` (added)

## Change Log

- 2026-03-11: Story 2.1 implemented; schema VERSION 2, runMigrations, Task type and mapper updated; tests added; status → review.
