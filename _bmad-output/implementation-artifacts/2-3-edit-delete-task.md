# Story 2.3: Edit & Delete Task

Status: done

## Story

As a **user**,
I want **to edit or delete an existing task**,
so that **I can keep my task list accurate as plans change**.

## Acceptance Criteria

**AC1 — Edit and persist**
- Given the user taps on an existing task
- When they modify the title or due date and save
- Then the updated task is persisted in SQLite and reflected immediately in the list

**AC2 — Delete with confirm**
- Given the user chooses to delete a task
- When they confirm the deletion
- Then the task is removed from SQLite and disappears from the list immediately

**AC3 — Navigate away without saving**
- Given the user begins editing a task but navigates away without saving
- When they return to the task list
- Then the original task data is unchanged

## Tasks / Subtasks

- [x] **Task 1: Edit flow** (AC1)
  - [x] Verify tap on task opens CreateTaskScreen in edit mode (taskId in route)
  - [x] Verify Save calls tasksService.updateTask and dispatch(updateTaskAction); list updates via reducer
  - [x] Ensure SQLite update and Redux update are in place

- [x] **Task 2: Delete flow** (AC2)
  - [x] Verify Delete shows confirmation Alert; on confirm call tasksService.deleteTask
  - [x] After successful delete, dispatch removeTask(taskId) so list updates immediately (not only on next fetch)
  - [x] Ensure task is removed from SQLite (soft or hard delete as per codebase)

- [x] **Task 3: No save on back** (AC3)
  - [x] Verify back/dismiss without tapping Save does not call updateTask; original data unchanged

- [x] **Task 4: Tests** (AC1–AC3)
  - [x] Add tests for reducer update/remove; or service update/delete behaviour

## Dev Notes

- Edit: CreateTaskScreen + useTaskEditor with taskId; tasksService.updateTask + updateTaskAction already in place.
- Delete: useTaskEditor handleDelete must dispatch removeTask after successful delete so list updates immediately.
- tasksReducer already handles UPDATE_TASK and REMOVE_TASK.

## Dev Agent Record

- **Edit flow (AC1):** Already implemented. Tap task → CreateTaskScreen with route.params.taskId; useTaskEditor loads task, handleSave calls tasksService.updateTask + dispatch(updateTaskAction(taskId, updates)); tasksReducer UPDATE_TASK merges updates; SQLite updated in tasksService.
- **Delete flow (AC2):** useTaskEditor handleDelete shows Alert; on confirm calls tasksService.deleteTask(taskId). **Fix:** After result.success, dispatch(removeTask(taskId)) added so the list updates immediately without refetch. tasksReducer REMOVE_TASK filters out the task.
- **No save on back (AC3):** Back/dismiss does not call handleSave; only Save button triggers update. No change needed.
- **Tests:** __tests__/story-2-3-edit-delete-task.test.ts — reducer UPDATE_TASK merges by local_id, REMOVE_TASK removes by local_id. Full suite 52 tests pass.

## File List

- `src/presentation/hooks/useTaskEditor.ts` (modified — import removeTask, dispatch removeTask after successful delete)
- `_bmad-output/implementation-artifacts/2-3-edit-delete-task.md` (created, updated)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `__tests__/story-2-3-edit-delete-task.test.ts` (added)

## Change Log

- 2026-03-11: Story 2.3 implemented; delete now dispatches removeTask for immediate list update; reducer tests added; status → review.
- 2026-03-11: AllTasksScreen swipe-to-complete/delete added; validation fix for edit mode (past due dates allowed); actual error messages shown in alert; status → done.
