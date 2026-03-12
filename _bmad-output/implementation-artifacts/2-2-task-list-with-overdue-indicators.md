# Story 2.2: Task List with Overdue Indicators

Status: review

## Story

As a **user**,
I want **to see all my tasks listed with clear overdue indicators**,
so that **I can immediately see which tasks need attention today**.

## Acceptance Criteria

**AC1 — Overdue visually distinguished**
- Given the user has tasks with past due dates
- When they open the task list
- Then overdue tasks are visually distinguished (e.g., different colour or label) from upcoming tasks

**AC2 — Empty state**
- Given the user has no tasks
- When they open the home screen
- Then an empty state is shown with a clear prompt to create their first task

**AC3 — Logical order**
- Given the user has a mix of overdue, today, and future tasks
- When viewing the list
- Then tasks are displayed in a logical order (overdue first or sorted by due date)

## Tasks / Subtasks

- [x] **Task 1: Sort tasks — overdue first, then by due date** (AC3)
  - [x] In useTasks or searchFilterService, sort filtered list: overdue (due_date < now) first, then by due_date ascending, then tasks without due_date last
  - [x] Apply this order to the task list on Home and All Tasks

- [x] **Task 2: Overdue visual in task cards** (AC1)
  - [x] In TaskCard and SimpleTaskCard, when task has due_date in the past, show due date in error/red colour or add "Overdue" label
  - [x] Ensure overdue is clear at a glance

- [x] **Task 3: Empty state** (AC2)
  - [x] Verify Home (HorizontalTaskList) and AllTasksScreen show empty message "Create your first task!" when no tasks
  - [x] No code change if already present

- [x] **Task 4: Tests** (AC1–AC3)
  - [x] Add tests for sort order (overdue first, then by due date); optional: overdue helper

## Dev Notes

- Overdue = due_date exists and new Date(due_date) < start of today (or < now for strictness).
- Use colors.error for overdue styling. Keep existing empty messages.

## Dev Agent Record

- **searchFilterService:** Added `isOverdue(task)` (due_date before start of today) and `sortTasksWithOverdueFirst(tasks)` — overdue first, then by due_date asc, then no due_date last.
- **useTasks:** Filtered list is now sorted with `sortTasksWithOverdueFirst` so Home and All Tasks show the same order.
- **TaskCard:** Uses `isOverdue`; when overdue, label shows "Overdue" and date/time use `overdueText` (red).
- **SimpleTaskCard:** Uses `isOverdue`; when overdue, due date shows "Overdue · {date}" in red (`overdueDueDate`).
- **Empty state:** HomeScreen passes emptyMessage "No tasks found. Create your first task!"; AllTasksScreen shows "No tasks found. Create your first task!" — already satisfied.
- **Tests:** __tests__/story-2-2-overdue-indicators.test.ts — isOverdue (no due_date, past, today/future), sortTasksWithOverdueFirst order. Full suite 50 tests pass.

## File List

- `src/application/services/tasks/searchFilterService.ts` (modified)
- `src/presentation/hooks/useTasks.ts` (modified)
- `src/presentation/component/TaskCard.tsx` (modified)
- `src/presentation/component/SimpleTaskCard.tsx` (modified)
- `_bmad-output/implementation-artifacts/2-2-task-list-with-overdue-indicators.md` (created, updated)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `__tests__/story-2-2-overdue-indicators.test.ts` (added)

## Change Log

- 2026-03-11: Story 2.2 implemented; overdue sort, overdue styling in TaskCard/SimpleTaskCard; tests added; status → review.
