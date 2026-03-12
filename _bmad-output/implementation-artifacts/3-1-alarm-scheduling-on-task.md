# Story 3.1: Alarm Scheduling on Task

Status: done

## Story

As a **user**,
I want **to set an alarm time on a task**,
So that **my phone reminds me when it's time to act**.

## Acceptance Criteria

**AC1 — Schedule alarm notification**
- Given the user is creating or editing a task
- When they enable the alarm toggle and set a time
- Then a @notifee local notification is scheduled for that exact time
- And the alarm time is saved with the task in SQLite

**AC2 — Notification fires in background**
- Given the user saves a task with an alarm
- When the scheduled time arrives and the app is backgrounded
- Then a push notification fires with the task title visible in the notification

**AC3 — Cancel alarm on task delete**
- Given the user deletes a task that has an alarm set
- When the deletion is confirmed
- Then the scheduled @notifee notification is cancelled and will not fire

## Tasks / Subtasks

- [x] **Task 1: Data layer** (AC1)
  - [x] Add alarm fields to `CreateTaskPayload` and `UpdateTaskPayload`
  - [x] `tasksSQLiteService.createTask` persists alarm fields
  - [x] `tasksSQLiteService.updateTask` persists alarm fields

- [x] **Task 2: Notification service** (AC1–AC3)
  - [x] Add `scheduleAlarmNotification(task)` — uses `alarm_time`, ID: `{taskId}_alarm`
  - [x] Add `cancelAlarmNotification(taskId)` — cancels `{taskId}_alarm`

- [x] **Task 3: Wire in tasksService** (AC1–AC3)
  - [x] `createTask`: schedule alarm if `alarm_enabled === 1` and `alarm_time` is future
  - [x] `updateTask`: cancel old alarm + reschedule if needed
  - [x] `deleteTask`: cancel alarm notification

- [x] **Task 4: UI — Alarm section on CreateTaskScreen** (AC1)
  - [x] Enable Alarm toggle
  - [x] Alarm time picker (visible when alarm enabled)
  - [x] Photo Dismiss toggle (visible when alarm enabled)

- [x] **Task 5: Tests** (AC1–AC3)
  - [x] Alarm notification ID format
  - [x] Schedule/cancel logic
  - [x] SQLite fields in UpdateTaskPayload type

## Dev Notes

- Alarm notification ID: `{local_id}_alarm` to avoid collision with due-date reminder (`{local_id}`)
- `photo_dismiss_enabled` is stored; it will be enforced in Story 3.3 alarm dismiss screen
- `photo_dismiss_tolerance` defaults to `0.7` — no UI control in MVP 1
- AC2 relies on OS delivering notifee `TimestampTrigger` in background — no extra code needed beyond scheduling

## Dev Agent Record

- **Schema/migration:** `alarm_time`, `alarm_enabled`, `photo_dismiss_enabled`, `photo_dismiss_tolerance` already in schema (Story 2.1). No new migration needed.
- **Data types:** Added `alarm_time`, `alarm_enabled`, `photo_dismiss_enabled` to `CreateTaskPayload` and `UpdateTaskPayload`.
- **SQLite service:** `tasksSQLiteService.createTask` INSERT now includes alarm columns. `updateTask` handles `alarm_time`, `alarm_enabled`, `photo_dismiss_enabled` in the dynamic SET clause.
- **Notification service:** Added `scheduleAlarmNotification(task)` (ID: `{local_id}_alarm`, uses `alarm_time`, fires `screen: AlarmDismiss`) and `cancelAlarmNotification(taskId)` to `notificationService`.
- **tasksService:** `createTask` schedules alarm after creation if `alarm_enabled === 1`. `updateTask` cancels + reschedules alarm on every update. `deleteTask` cancels alarm notification.
- **useTaskEditor:** Added `alarmEnabled`, `alarmTime`, `photoDismissEnabled`, `showAlarmTimePicker` state. Loaded from existing task on edit open. Handlers: `handleToggleAlarm`, `handleAlarmTimeChange`, `handleTogglePhotoDismiss`, `handleShowAlarmTimePicker`. `handleSave` merges alarm payload into create/update calls.
- **CreateTaskScreen:** Added Alarm section (card-style) with Enable Alarm `Switch`, Alarm Time touchable row (opens `DateTimePicker` in time mode), Photo Dismiss `Switch`. All hidden when alarm is off.
- **Tests:** `__tests__/story-3-1-alarm-scheduling.test.ts` — 14 tests pass.

## File List

- `src/domain/types/tasks/TaskType.ts` (modified — alarm fields in CreateTaskPayload + UpdateTaskPayload)
- `src/application/services/tasks/tasksSQLiteService.ts` (modified — createTask INSERT + updateTask alarm fields)
- `src/application/services/notifications/notificationService.ts` (modified — scheduleAlarmNotification, cancelAlarmNotification added)
- `src/application/services/tasks/tasksService.ts` (modified — alarm schedule/cancel in create/update/delete)
- `src/presentation/hooks/useTaskEditor.ts` (modified — alarm state, handlers, save payload)
- `src/presentation/screens/CreateTaskScreen.tsx` (modified — Alarm UI section)
- `__tests__/story-3-1-alarm-scheduling.test.ts` (created)
- `_bmad-output/implementation-artifacts/3-1-alarm-scheduling-on-task.md` (created)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated)

## Change Log

- 2026-03-11: Story 3.1 implementation started; status → in-progress.
- 2026-03-11: All tasks complete — alarm notification service, SQLite wiring, UI toggle section, 14 tests pass; status → review.
