# Story 2.4: Favourite Tasks

Status: done

## Story

As a **user**,
I want **to mark tasks as favourites**,
So that **I can quickly identify my most important tasks**.

## Acceptance Criteria

**AC1 — Toggle favourite on a task**
- Given the user opens an existing task (edit mode)
- When they tap the star toggle in the header
- Then the task is marked as favourite and a filled star indicator appears on the task card

**AC2 — Unmark favourite**
- Given a task is already favourited
- When the user taps the star toggle again
- Then the favourite status is removed and the star indicator disappears

**AC3 — Favourite status persisted**
- Given the app is restarted
- When the task list loads
- Then favourite status is preserved as stored in SQLite (is_favourite column)

## Tasks / Subtasks

- [x] **Task 1: Data layer** (AC1–AC3)
  - [x] Add `is_favourite` to `UpdateTaskPayload` type
  - [x] Handle `is_favourite` in `tasksSQLiteService.updateTask`
  - [x] Schema and migration already present from Story 2.1 (is_favourite INTEGER DEFAULT 0)

- [x] **Task 2: Toggle in edit screen** (AC1–AC2)
  - [x] Add `isFavourite` state + `handleToggleFavourite` to `useTaskEditor`
  - [x] Load `is_favourite` from existing task on edit screen open
  - [x] `handleToggleFavourite`: optimistic state update, immediate SQLite persist, Redux dispatch
  - [x] Render star button in `CreateTaskScreen` gradient header (edit mode only)

- [x] **Task 3: Visual indicator on cards** (AC1–AC2)
  - [x] Add `StarIcon` SVG component
  - [x] Show filled star in `SimpleTaskCard` title row when `task.is_favourite === 1`
  - [x] Show filled star in `TaskCard` title row when `task.is_favourite === 1`

- [x] **Task 4: Tests** (AC1–AC3)
  - [x] Redux UPDATE_TASK merges is_favourite correctly
  - [x] Favourite indicator logic (is_favourite === 1)
  - [x] UpdateTaskPayload type includes is_favourite

## Dev Notes

- SQLite column `is_favourite INTEGER DEFAULT 0` was added in Story 2.1 migration.
- Toggle is immediate (optimistic update + async persist). On error, state rolls back.
- Star icon: filled (gold/warning colour) = favourite; outline = not favourite.
- Toggle only visible in edit mode; create mode defaults to not favourite.

## Dev Agent Record

- **Data layer:** `UpdateTaskPayload.is_favourite` added. `tasksSQLiteService.updateTask` now persists `is_favourite` when present in the update payload. No migration needed (column exists from Story 2.1).
- **Toggle in edit:** `useTaskEditor` gained `isFavourite` state (loaded from task on mount), `handleToggleFavourite` (optimistic toggle, async tasksService.updateTask + dispatch updateTaskAction). `CreateTaskScreen` imports `StarIcon`; a star `TouchableOpacity` is rendered absolutely in the gradient header when `isEditMode` is true.
- **Card indicators:** `SimpleTaskCard` and `TaskCard` both import `StarIcon` and render a small filled star (color: warning/gold) alongside the title when `task.is_favourite === 1`.
- **Tests:** `__tests__/story-2-4-favourite-tasks.test.ts` — 7 tests pass.

## File List

- `src/domain/types/tasks/TaskType.ts` (modified — UpdateTaskPayload.is_favourite added)
- `src/application/services/tasks/tasksSQLiteService.ts` (modified — is_favourite handled in updateTask)
- `src/presentation/hooks/useTaskEditor.ts` (modified — isFavourite state, handleToggleFavourite)
- `src/presentation/screens/CreateTaskScreen.tsx` (modified — star toggle button in header)
- `src/presentation/component/svgs/StarIcon.tsx` (created)
- `src/presentation/component/SimpleTaskCard.tsx` (modified — star indicator)
- `src/presentation/component/TaskCard.tsx` (modified — star indicator)
- `__tests__/story-2-4-favourite-tasks.test.ts` (created)
- `_bmad-output/implementation-artifacts/2-4-favourite-tasks.md` (created)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated)

## Change Log

- 2026-03-11: Story 2.4 implemented; favourite toggle on edit screen, star indicators on cards, SQLite persist, Redux sync; 7 tests pass; status → review.
- 2026-03-11: All ACs verified; Favourite filter tab added to HomeScreen FilterButtons; status → done.
