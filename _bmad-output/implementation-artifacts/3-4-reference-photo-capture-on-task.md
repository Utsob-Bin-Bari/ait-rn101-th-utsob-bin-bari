# Story 3.4: Reference Photo Capture on Task

Status: done

## Story

As a **user**,
I want **to attach a reference photo to a task when enabling the alarm**,
So that **the app knows what photo I need to take to prove I completed the task**.

## Acceptance Criteria

**AC1 — Reference photo section appears when alarm enabled**
- Given the user enables the alarm toggle on a task
- When the toggle is turned on
- Then a "Set Reference Photo" section appears in the alarm card
- And the user can tap it to open the camera or gallery

**AC2 — Photo saved to filesystem and path stored**
- Given the user captures or picks a reference photo
- When the photo is confirmed
- Then the image is saved to the local filesystem via `imageService.saveImageLocally`
- And the file path (`photo_dismiss_ref_path`) is stored with the task in SQLite (DB migration v3)
- And a thumbnail preview of the reference photo is shown in the task form

**AC3 — Edit mode shows existing thumbnail**
- Given the user edits a task that already has a reference photo
- When the edit screen opens
- Then the existing reference photo thumbnail is shown
- And the user can replace it by tapping the thumbnail

**AC4 — Validation: ref photo required when alarm enabled**
- Given the user saves a task with alarm enabled but no reference photo set
- When they tap Save
- Then a validation error is shown: "Please set a reference photo to use photo dismiss"
- And the task is not saved until a reference photo is provided

**AC5 — Ref photo file deleted with task**
- Given the user deletes a task with a reference photo
- When deletion is confirmed
- Then the stored reference photo file is also deleted from the filesystem

**AC6 — photo_dismiss_tolerance stored as 0.7**
- Given a task is saved with alarm enabled
- When the task is created or updated
- Then `photo_dismiss_tolerance` is stored as `0.7` by default

## Tasks / Subtasks

- [x] **Task 1: DB migration v3** (AC2, AC6)
  - [x] Add `photo_dismiss_ref_path TEXT DEFAULT NULL` to `DatabaseSchema.ts` CREATE TABLE
  - [x] Bump `DATABASE_SCHEMA.VERSION` to 3
  - [x] Add migration v3 block in `DatabaseInit.ts` `runMigrations()`

- [x] **Task 2: Type extensions** (AC2)
  - [x] Add `photo_dismiss_ref_path?: string | null` to `Task` in `TaskType.ts`
  - [x] Add to `CreateTaskPayload` and `UpdateTaskPayload`
  - [x] Add to `LocalTask` interface and `transformDbTaskToTask` in `tasksSQLiteService.ts`
  - [x] Add to `createTask` INSERT and `updateTask` dynamic SET

- [x] **Task 3: useTaskEditor** (AC1–AC4)
  - [x] Add `refPhotoUri` state, load from `task.photo_dismiss_ref_path` on edit
  - [x] Add `handleRefPhotoPick(source)` — calls `imageService` and saves with `saveImageLocally`
  - [x] Add `handleRefPhotoRemove()` — clears state and payload field
  - [x] In `handleSave`: validate `alarmEnabled && !refPhotoUri` → Alert error
  - [x] Include `photo_dismiss_ref_path` in create/update payload

- [x] **Task 4: CreateTaskScreen UI** (AC1–AC3)
  - [x] Add ref photo section inside `alarmEnabled` expanded block
  - [x] Thumbnail shown when `refPhotoUri` set; tap = replace
  - [x] Tap target "📷 Set Reference Photo" when no photo set
  - [x] Alert with Camera / Gallery / Cancel options

- [x] **Task 5: tasksService.deleteTask** (AC5)
  - [x] Fetch task before delete; call `imageService.deleteLocalImage` if `photo_dismiss_ref_path` set

- [x] **Task 6: Tests** (AC1–AC6)
  - [x] DB schema contains `photo_dismiss_ref_path` column
  - [x] `photo_dismiss_ref_path` in type payloads
  - [x] Ref photo save path convention
  - [x] Validation rejects save without ref photo when alarm enabled
  - [x] DeleteTask deletes ref photo file

## Dev Notes

- `imageService.saveImageLocally(asset, taskId)` saves to `DocumentDir/task_images/task_{id}_{ts}.jpg`
- Ref photo stored at same path convention, with prefix `ref_` for clarity.
- `photo_dismiss_tolerance` is always 0.7 — no UI control in MVP 1.
- On alarm toggle OFF → `refPhotoUri` is cleared + `photo_dismiss_ref_path: null` saved.

## File List

- `src/infrastructure/storage/DatabaseSchema.ts` (modified — photo_dismiss_ref_path column, VERSION 3)
- `src/infrastructure/storage/DatabaseInit.ts` (modified — migration v3)
- `src/domain/types/tasks/TaskType.ts` (modified — photo_dismiss_ref_path field)
- `src/application/services/tasks/tasksSQLiteService.ts` (modified — LocalTask + transform + CRUD)
- `src/presentation/hooks/useTaskEditor.ts` (modified — refPhotoUri + handlers + validation)
- `src/presentation/screens/CreateTaskScreen.tsx` (modified — ref photo UI in alarm section)
- `src/application/services/tasks/tasksService.ts` (modified — deleteTask cleans up ref photo)
- `__tests__/story-3-4-reference-photo-capture.test.ts` (created)
- `_bmad-output/implementation-artifacts/3-4-reference-photo-capture-on-task.md` (created)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated)

## Change Log

- 2026-03-12: Story 3.4 created; status → in-progress.
- 2026-03-12: All tasks complete — DB v3 migration, type extensions, useTaskEditor, CreateTaskScreen UI, tasksService cleanup, 15 tests pass; status → review.
