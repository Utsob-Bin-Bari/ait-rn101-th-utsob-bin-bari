# Story 3.2: Notification Deep Link to Dismiss Screen

Status: done

## Story

As a **user**,
I want **tapping a TaskBell notification to open the alarm dismiss screen for that task**,
So that **I can act on the alarm immediately from the notification**.

## Acceptance Criteria

**AC1 — Background tap navigates to AlarmDismissScreen**
- Given a TaskBell alarm notification has fired
- When the user taps the notification while the app is in the background
- Then the app opens and navigates directly to the alarm dismiss screen for the correct task

**AC2 — Cold start navigates to AlarmDismissScreen**
- Given a TaskBell alarm notification has fired
- When the user taps the notification and the app is fully closed (cold start)
- Then the app launches, initialises the guest session, and navigates to the alarm dismiss screen
- And no crash or blank screen occurs during this cold-start navigation

**AC3 — Foreground tap navigates to AlarmDismissScreen**
- Given the user is already in the app when a notification fires
- When they tap the notification banner
- Then the app navigates to the alarm dismiss screen for that task without restarting

## Tasks / Subtasks

- [x] **Task 1: AlarmDismissScreen** (AC1–AC3)
  - [x] Create `AlarmDismissScreen` — shows task title, alarm info, Dismiss button
  - [x] Accept `taskId` route param; load task from store/SQLite
  - [x] Show photo-dismiss badge when `photo_dismiss_enabled === 1` (enforcement in 3.3)

- [x] **Task 2: Register screen in navigation** (AC2)
  - [x] Add `AlarmDismiss` as root-level Stack.Screen in `AppNavigator`
  - [x] Presented as modal so it overlays from any navigation context

- [x] **Task 3: Notification press routing** (AC1–AC3)
  - [x] Update `onForegroundEvent` handler — route to `AlarmDismiss` when `data.screen === 'AlarmDismiss'`
  - [x] Update `checkInitialNotification` (cold start) — same routing logic
  - [x] Due-date notifications (`data.screen === 'CreateTask'`) unchanged

- [x] **Task 4: Background event handler** (AC1)
  - [x] Register `notifee.onBackgroundEvent` in `index.js` (required by notifee; logs action events)

- [x] **Task 5: Tests** (AC1–AC3)
  - [x] Notification routing logic (screen field discrimination)
  - [x] Cold start navigation intent

## Dev Notes

- `AlarmDismissScreen` is a root Stack.Screen in `AppNavigator` — accessible from any context.
- Navigation: `navigationRef.current.navigate('AlarmDismiss', { taskId })`
- `onForegroundEvent` handles both foreground and background tap (notifee fires it when app resumes from background on notification tap).
- `onBackgroundEvent` required by notifee to prevent silent crash; no navigation possible from there.
- Photo enforcement (camera, validation) is Story 3.3 — this screen shows a placeholder when `photo_dismiss_enabled === 1`.

## Dev Agent Record

- **AlarmDismissScreen:** Full-screen gradient modal; loads task from Redux store (or SQLite fallback); shows alarm time, task title/description, photo-dismiss badge when `photo_dismiss_enabled === 1`. "Dismiss Alarm" button calls `cancelAlarmNotification` and navigates back. "Snooze" goes back without cancelling.
- **Navigation:** `AlarmDismiss` added as root `Stack.Screen` with `presentation: 'modal'` in `AppNavigator` — accessible from any context including cold start.
- **Notification routing:** `handleNotificationPress` updated to check `data.screen`; routes to `AlarmDismiss` for alarm notifications, `CreateTask` for due-date reminders. Both `onForegroundEvent` and `getInitialNotification` (cold start) use the same routing logic.
- **Background handler:** `notifee.onBackgroundEvent` registered in `index.js` (required by notifee). Navigation happens via `onForegroundEvent` when app resumes.
- **Tests:** `__tests__/story-3-2-notification-deep-link.test.ts` — 9 tests pass covering routing logic, data fields, and cold-start intent.

## File List

- `src/presentation/screens/AlarmDismissScreen.tsx` (created)
- `src/presentation/navigation/AppNavigator.tsx` (modified — AlarmDismiss screen + updated notification routing)
- `index.js` (modified — notifee.onBackgroundEvent registered)
- `__tests__/story-3-2-notification-deep-link.test.ts` (created)
- `_bmad-output/implementation-artifacts/3-2-notification-deep-link-to-dismiss-screen.md` (created)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated)

## Change Log

- 2026-03-11: Story 3.2 implementation started; status → in-progress.
- 2026-03-11: All tasks complete — AlarmDismissScreen, modal registration, notification routing, background handler, 9 tests pass; status → review.
- 2026-03-11: UX refinement — alarm time tied to due date (no separate alarm date/time), photo dismiss mandatory; status → done.
