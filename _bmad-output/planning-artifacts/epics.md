---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - 'docs/architecture.md'
---

# TaskBell - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for TaskBell, decomposing the requirements from the PRD and Architecture into implementable stories for MVP 1.

## Requirements Inventory

### Functional Requirements

FR1: App must display a custom branded icon and splash screen on launch (both iOS and Android)
FR2: App must not require user authentication — cold start routes directly to home screen (guest mode only, no login screen)
FR3: Auth-related UI (LogInScreen, SignUpScreen) must be removed from the navigation flow or gated out of MVP 1
FR4: User must be able to create a task with a title and optional due date
FR5: User must be able to read (list and view) all tasks
FR6: User must be able to update (edit) an existing task
FR7: User must be able to delete a task
FR8: User must be able to mark/unmark a task as favourite
FR9: Tasks must persist in SQLite across app restarts
FR10: Tasks with due dates in the past must be visually surfaced as overdue in the task list
FR11: User must be able to set an alarm on a task by specifying a time (tied to due date)
FR12: App must schedule a local push notification that fires at the alarm time using @notifee
FR13: Notification tap must deep-link into the app and open the alarm dismiss screen for that specific task
FR14: App must cold-start correctly when launched via deep link from a notification tap (taskbell://)
FR15: User must be able to enable photo-to-dismiss on a per-task alarm
FR16: When photo-dismiss is enabled, alarm can only be cleared by taking and validating a photo
FR17: Photo validation must have configurable error tolerance (fuzzy match — not pixel-perfect)
FR18: On first alarm creation on Android, app must prompt user to grant battery optimisation exemption
FR19: Alarm must fire reliably when app is backgrounded on aggressive OEM Android devices (Techno Spark)
FR20: All MVP 1 features must function with zero server dependency (SQLite + guest mode only)

### NonFunctional Requirements

NFR1: Zero crashes on core flows — task create, alarm set, photo-dismiss, task complete, task delete
NFR2: No UI layout breaks on standard phone screen sizes (360dp width – 430px width range)
NFR3: Background alarm must fire after app has been backgrounded for 10+ minutes on test device
NFR4: Photo-dismiss must complete without crash on first attempt on both iOS and Android
NFR5: App must pass Apple App Store and Google Play Store review (first or second submission)
NFR6: App must cold-start from deep link notification tap without crash or blank screen
NFR7: All 6 MVP 1 features must work end-to-end without requiring a network connection

### Additional Requirements

- **Architecture:** Clean Architecture layer boundaries must be strictly preserved — no layer violations (e.g. no Axios calls from screens, no SQLite from Application layer directly)
- **Architecture:** All task state mutations must go through Redux Toolkit (tasksReducer) with optimistic update + rollback pattern
- **Architecture:** All SQLite access must use `DatabaseInit.getInstance()` singleton — never open a new connection
- **Architecture:** All SQLite write operations must use `transaction()` — no direct `executeSql` for writes
- **Architecture:** Notification scheduling must use `notificationService.ts` in Application layer — never call @notifee directly from screens
- **Architecture:** Auth navigation bypass — `AppNavigator` must route cold-start directly to TabNavigator (skip AuthStackNavigator) in guest mode
- **Architecture:** Sync queue and server-side operations must remain isolated and dormant in MVP 1 — no sync triggered in guest mode
- **Architecture:** Deep link scheme `taskbell://` must be registered in both `android/app/src/main/AndroidManifest.xml` and `ios/TaskBell/Info.plist`
- **Architecture:** Image capture via `react-native-image-picker`, storage via `imageStorage.ts` in Infrastructure layer
- **Architecture:** App icon assets placed in platform-specific asset folders; splash screen configured per platform

### FR Coverage Map

FR1: Epic 1 — Branded icon + splash screen
FR2: Epic 1 — Cold start routes to home (no auth)
FR3: Epic 1 — Auth screens removed from navigation
FR4: Epic 2 — Create task with title + due date
FR5: Epic 2 — List and view all tasks
FR6: Epic 2 — Edit existing task
FR7: Epic 2 — Delete task
FR8: Epic 2 — Favourite/unfavourite task
FR9: Epic 2 — SQLite persistence across sessions
FR10: Epic 2 — Overdue task surfacing
FR11: Epic 3 — Set alarm time on task
FR12: Epic 3 — Schedule @notifee local notification
FR13: Epic 3 — Notification tap → deep link to dismiss screen
FR14: Epic 3 — Cold start correctly from notification tap
FR15: Epic 3 — Enable photo-to-dismiss per task
FR16: Epic 3 — Photo required to clear alarm
FR17: Epic 3 — Configurable photo validation error tolerance
FR18: Epic 4 — Battery optimisation exemption prompt (Android)
FR19: Epic 4 — Alarm fires on OEM devices after 10+ min background
FR20: Epic 4 — All features work offline, zero server dependency

## Epic List

### Epic 1: App Identity & Frictionless Launch
Users open a polished, branded app and land directly on their task list — no login, no friction, straight to value.
**FRs covered:** FR1, FR2, FR3

### Epic 2: Task Planning Foundation
Users can create, manage, and track their tasks with full CRUD, favourites, and due-date awareness — all persisted locally.
**FRs covered:** FR4, FR5, FR6, FR7, FR8, FR9, FR10

### Epic 3: Alarm with Photo Accountability
Users can arm tasks with timed alarms dismissible only by taking a photo — the pre-commitment contract made physical.
**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17

### Epic 4: Reliable Background Alarms (Android OEM)
Users on aggressive Android OEM devices (Techno, Chinese OEMs) can trust alarms will fire reliably even after the app is backgrounded.
**FRs covered:** FR18, FR19, FR20

---

## Epic 1: App Identity & Frictionless Launch

Users open a polished, branded app and land directly on their task list — no login, no friction, straight to value.

### Story 1.1: App Icon & Splash Screen

As a **user**,
I want **the app to display a custom TaskBell icon and branded splash screen on launch**,
So that **the app feels polished and trustworthy from the first interaction**.

**Acceptance Criteria:**

**Given** the TaskBell app is installed on an Android device
**When** the user taps the app icon
**Then** the TaskBell custom icon is displayed on the home screen (not the default React Native icon)
**And** a branded splash screen is shown during app initialisation before the home screen appears

**Given** the TaskBell app is installed on an iOS device
**When** the user taps the app icon
**Then** the TaskBell custom icon is displayed (correct sizes for all required iOS icon slots)
**And** the launch screen matches the TaskBell brand (no white blank screen or default RN splash)

---

### Story 1.2: Guest-Only Launch Flow

As a **user**,
I want **to open the app and land directly on the home screen without any login prompt**,
So that **I can start planning tasks immediately with zero friction**.

**Acceptance Criteria:**

**Given** a fresh install of TaskBell with no existing session
**When** the user cold-starts the app
**Then** the app navigates directly to the `TabNavigator` (HomeScreen) — `AuthStackNavigator` is never shown
**And** no login, signup, or "continue as guest" prompt appears

**Given** the app is restarted after previous use
**When** the app initialises
**Then** the existing local task data is loaded and the home screen is shown — no re-authentication required

**Given** the codebase contains `LogInScreen` and `SignUpScreen`
**When** the app is built for MVP 1
**Then** both screens remain in the codebase but `AppNavigator` never routes to `AuthStackNavigator` — no navigation path leads to either screen in MVP 1
**And** app startup initialises a guest session automatically via `loginAsGuest.ts` without any user action

---

## Epic 2: Task Planning Foundation

Users can create, manage, and track their tasks with full CRUD, favourites, and due-date awareness — all persisted locally.

### Story 2.1: Create Task with Title & Due Date

As a **user**,
I want **to create a task with a title and optional due date**,
So that **I can capture what I need to do and when**.

**Acceptance Criteria:**

**Given** the user is on the task creation screen
**When** they enter a title and tap Save
**Then** the task is saved to SQLite and appears in the task list immediately (optimistic update)
**And** the task persists after the app is closed and reopened

**Given** the user sets a due date on the task
**When** the task is saved
**Then** the due date is stored and displayed on the task card in the list

**Given** the user submits a task with no title
**When** they tap Save
**Then** a validation error is shown and the task is not saved

**Given** the app is opened on a device with an existing VERSION 1 database (or on a fresh install)
**When** the app initialises
**Then** `DatabaseInit.runMigrations()` adds the 5 new columns (`is_favourite`, `alarm_time`, `alarm_enabled`, `photo_dismiss_enabled`, `photo_dismiss_tolerance`) with correct defaults and bumps the schema to VERSION 2 without data loss

---

### Story 2.2: Task List with Overdue Indicators

As a **user**,
I want **to see all my tasks listed with clear overdue indicators**,
So that **I can immediately see which tasks need attention today**.

**Acceptance Criteria:**

**Given** the user has tasks with past due dates
**When** they open the task list
**Then** overdue tasks are visually distinguished (e.g., different colour or label) from upcoming tasks

**Given** the user has no tasks
**When** they open the home screen
**Then** an empty state is shown with a clear prompt to create their first task

**Given** the user has a mix of overdue, today, and future tasks
**When** viewing the list
**Then** tasks are displayed in a logical order (overdue first or sorted by due date)

---

### Story 2.3: Edit & Delete Task

As a **user**,
I want **to edit or delete an existing task**,
So that **I can keep my task list accurate as plans change**.

**Acceptance Criteria:**

**Given** the user taps on an existing task
**When** they modify the title or due date and save
**Then** the updated task is persisted in SQLite and reflected immediately in the list

**Given** the user chooses to delete a task
**When** they confirm the deletion
**Then** the task is removed from SQLite and disappears from the list immediately

**Given** the user begins editing a task but navigates away without saving
**When** they return to the task list
**Then** the original task data is unchanged

---

### Story 2.4: Favourite Tasks

As a **user**,
I want **to mark tasks as favourites**,
So that **I can quickly identify my most important tasks**.

**Acceptance Criteria:**

**Given** the user views a task
**When** they tap the favourite toggle
**Then** the task is marked as favourite and a visual indicator (e.g., star/heart icon) appears on the task card

**Given** a task is already favourited
**When** the user taps the favourite toggle again
**Then** the favourite status is removed and the visual indicator disappears

**Given** the app is restarted
**When** the task list loads
**Then** favourite status is preserved as stored in SQLite

---

## Epic 3: Alarm with Photo Accountability

Users can arm tasks with timed alarms dismissible only by taking a photo — the pre-commitment contract made physical.

### Story 3.1: Alarm Scheduling on Task

As a **user**,
I want **to set an alarm time on a task**,
So that **my phone reminds me when it's time to act**.

**Acceptance Criteria:**

**Given** the user is creating or editing a task
**When** they enable the alarm toggle and set a time
**Then** a @notifee local notification is scheduled for that exact time
**And** the alarm time is saved with the task in SQLite

**Given** the user saves a task with an alarm
**When** the scheduled time arrives and the app is backgrounded
**Then** a push notification fires with the task title visible in the notification

**Given** the user deletes a task that has an alarm set
**When** the deletion is confirmed
**Then** the scheduled @notifee notification is cancelled and will not fire

---

### Story 3.2: Notification Deep Link to Dismiss Screen

As a **user**,
I want **tapping a TaskBell notification to open the alarm dismiss screen for that task**,
So that **I can act on the alarm immediately from the notification**.

**Acceptance Criteria:**

**Given** a TaskBell alarm notification has fired
**When** the user taps the notification while the app is in the background
**Then** the app opens and navigates directly to the alarm dismiss screen for the correct task

**Given** a TaskBell alarm notification has fired
**When** the user taps the notification and the app is fully closed (cold start)
**Then** the app launches, initialises the guest session, and navigates to the alarm dismiss screen via `taskbell://` deep link
**And** no crash or blank screen occurs during this cold-start navigation

**Given** the user is already in the app when a notification fires
**When** they tap the notification banner
**Then** the app navigates to the alarm dismiss screen for that task without restarting

---

### Story 3.3: Photo-to-Dismiss Alarm

As a **user**,
I want **to dismiss an alarm only by taking a photo**,
So that **I'm forced to physically prove I'm doing the task before the alarm stops**.

**Acceptance Criteria:**

**Given** a task has photo-dismiss enabled and the alarm has fired
**When** the user arrives at the alarm dismiss screen
**Then** the camera is activated and a "Take photo to dismiss" instruction is shown
**And** there is no simple "dismiss" or "snooze" tap button available

**Given** the user takes a photo on the dismiss screen
**When** the photo is captured
**Then** the photo is validated with configurable error tolerance (not pixel-perfect)
**And** if validation passes, the alarm is dismissed and the task is marked complete

**Given** the photo validation fails (e.g., blurry or wrong subject)
**When** the result is returned
**Then** the user is shown feedback and prompted to retake the photo
**And** the alarm continues until a valid photo is submitted

**Given** the user enables photo-dismiss on a task
**When** toggling it on in the task creation/edit screen
**Then** the option is saved with the task and the dismiss screen will enforce photo capture at alarm time

**Given** a task is saved with photo-dismiss enabled
**When** the task is created or updated
**Then** `photo_dismiss_tolerance` is stored as `0.7` by default — no UI control is provided in MVP 1 (user-configurable post-MVP 1)

---

## Epic 4: Reliable Background Alarms (Android OEM)

Users on aggressive Android OEM devices (Techno, Chinese OEMs) can trust alarms will fire reliably even after the app is backgrounded.

### Story 4.1: Android Battery Optimisation Exemption

As an **Android user**,
I want **the app to request battery optimisation exemption when I first set an alarm**,
So that **the OS doesn't kill TaskBell before my alarm fires**.

**Acceptance Criteria:**

**Given** an Android user creates a task with an alarm for the first time
**When** the alarm is saved
**Then** the app presents the system dialog requesting battery optimisation exclusion for TaskBell
**And** this prompt is shown only once — not on every alarm creation

**Given** the user grants the battery optimisation exemption
**When** they set future alarms
**Then** no further battery optimisation prompts are shown

**Given** the user denies the battery optimisation exemption
**When** they return to the app
**Then** the alarm is still scheduled and a warning is shown that alarm reliability may be reduced on this device
**And** the app does not crash or prevent alarm creation

---

### Story 4.2: OEM Background Alarm Reliability

As an **Android user on an aggressive OEM device** (Techno, Huawei, Xiaomi, etc.),
I want **my TaskBell alarms to fire even when the app has been backgrounded for an extended period**,
So that **I can trust the alarm will actually wake me or remind me**.

**Acceptance Criteria:**

**Given** a TaskBell alarm is scheduled and the app is backgrounded
**When** 10+ minutes pass on a standard Android device
**Then** the alarm notification fires at the correct time

**Given** a TaskBell alarm is scheduled and the app is backgrounded on a Techno Spark device
**When** the scheduled alarm time arrives
**Then** the alarm fires reliably — the OEM battery killer has not suppressed it
**And** this is achieved via Notifee foreground service and/or exact alarm API with wakelock

**Given** the app is fully offline (no network connection)
**When** an alarm is scheduled and fires
**Then** the alarm fires and photo-dismiss works correctly with zero network dependency
**And** no "network error" or sync failure blocks the alarm flow

**Given** the user denies the `SCHEDULE_EXACT_ALARM` permission on Android 12+
**When** they attempt to create a task with an alarm
**Then** the app shows a warning that alarm reliability may be reduced on this device and does not crash
**And** the alarm is still scheduled using the best available fallback mechanism
