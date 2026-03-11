---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/project-context.md'
  - 'docs/architecture.md'
  - 'docs/index.md'
  - 'docs/data-models.md'
  - 'docs/component-inventory.md'
workflowType: 'architecture'
project_name: 'TaskBell'
user_name: 'Utsob'
date: '2026-03-11'
lastStep: 8
status: 'complete'
completedAt: '2026-03-11'
---

# Architecture Decision Document — TaskBell MVP 1

> **Scope:** MVP 1 delta architecture — decisions required to production-ready the existing brownfield codebase for App Store / Play Store submission.
> **Principle:** Minimum change. Extend what exists. Nothing is replaced unless broken.

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements (20 total — 4 Epics, 11 Stories):**

| Epic | FRs | Architectural Implication |
|------|-----|--------------------------|
| 1 — App Identity & Launch | FR1–FR3 | App icon/splash assets; `AppNavigator` bypass to `TabNavigator` on cold start |
| 2 — Task Planning Foundation | FR4–FR10 | Extend `Task` domain type + SQLite schema; add `is_favourite` field |
| 3 — Alarm with Photo Accountability | FR11–FR17 | New `alarm_*` + `photo_dismiss_*` Task fields; new `AlarmDismissScreen`; new `alarmDismissService`; notification routing updated |
| 4 — Reliable Background Alarms | FR18–FR20 | Battery optimisation exemption; exact alarm API; foreground service config; sync guards for guest mode |

**Non-Functional Requirements:**
- NFR1: Zero crashes on 5 core flows → every new screen handles null/empty state defensively
- NFR2: Layout integrity on 360dp–430px → no hardcoded pixel widths in new screens
- NFR3: Background alarm fires after 10+ min → exact alarm API + battery optimisation exemption
- NFR4: Photo-dismiss crash-free on first attempt → camera permission pre-checked before screen opens
- NFR5: App Store + Play Store approval → standard system APIs only; no private frameworks
- NFR6: Cold-start from deep link without crash → `NavigationContainer` mounted before `navigate()` called
- NFR7: All features offline → no network call in any alarm, photo, or CRUD flow

**Scale & Complexity:**
- Primary domain: Mobile — React Native bare workflow (iOS + Android)
- Complexity: Medium (F6 Android OEM alarm reliability is the single high-risk item)
- New architectural components needed: 1 screen, 2 services, 5 domain type fields, 1 schema migration, 1 notification channel

### Technical Constraints & Dependencies

- React Native 0.82.1 bare workflow — no Expo managed APIs
- `@notifee/react-native ^9.1.8` already installed — use for exact alarms; no new notification library
- `react-native-image-picker ^8.2.1` already installed — camera capture already working; no new dep
- SQLite schema at VERSION 1 — migration to VERSION 2 required; must use `ALTER TABLE` (not DROP/RECREATE) to preserve existing user data
- Deep link scheme `taskbell://` already registered in `AndroidManifest.xml` and `ios/TaskBell/Info.plist`
- `json-server` backend exists but must not be called in MVP 1 guest mode
- No ML/vision libraries in the project — photo comparison must be pure JS (histogram approach)
- `diff-match-patch` is installed but inactive — leave as-is (prepared infrastructure)

### Cross-Cutting Concerns

1. **Offline-first constraint**: Every new service function completes without network; all server-call paths guard on `isGuest`
2. **Layer boundary enforcement**: `AlarmDismissScreen` → `useAlarmDismiss` hook → `alarmDismissService` (Application) → `imageStorage` (Infrastructure); no skipping
3. **SQLite schema migration**: New columns use `ALTER TABLE ... ADD COLUMN ... DEFAULT ...` pattern; VERSION bump triggers on next app open
4. **Navigation stack readiness**: Cold-start from deep link waits for `NavigationContainer` mount; existing `setTimeout` workaround in `AppNavigator` covers this
5. **Sync system dormancy**: `syncProcessor.ts` and all API request files short-circuit when `isGuest === true`; audit all entry points

---

## Starter Template Evaluation

**Not applicable — brownfield project.**

This is an existing React Native 0.82.1 bare workflow codebase being production-readied. The established tech stack is the foundation. No new initialisation command is needed. All architectural decisions build on the current setup without modification to core tooling.

**Established Stack (as-is):**
- Language: TypeScript ^5.8.3
- Runtime: React Native 0.82.1 (New Architecture enabled)
- State: Redux Toolkit ^2.10.1 + React Redux ^9.2.0
- Navigation: React Navigation v7 (Stack + Bottom Tabs)
- Storage: react-native-sqlite-storage ^6.0.1
- Notifications: @notifee/react-native ^9.1.8
- Testing: Jest ^29 + @testing-library/react-native ^13
- Linting: ESLint @react-native/eslint-config, Prettier 2.8.8

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (block implementation):**
1. Task domain type extension — alarm + favourite fields
2. SQLite schema migration strategy — ALTER TABLE approach
3. Guest-only cold start — navigation auto-init
4. Alarm notification routing — separate dismiss screen

**Important Decisions (shape architecture):**
5. Photo comparison algorithm — histogram similarity (pure JS)
6. Battery optimisation request strategy — one-time prompt via app_settings
7. Exact alarm API configuration — `alarmManager: true` on TimestampTrigger
8. Sync guard pattern — `isGuest` early-return at all sync entry points

**Deferred Decisions (post-MVP 1):**
- User accounts + cloud sync architecture
- Conflict resolution strategy (diff-match-patch already prepared)
- Multi-device session management
- Push notification infrastructure (remote)

---

### Data Architecture

#### Decision 1: Task Domain Type Extension

**Decision:** Extend the existing `Task` interface in `src/domain/types/tasks/TaskType.ts` with 5 new fields. Do NOT redesign the type — append only.

```typescript
// Fields to ADD to existing Task interface:
is_favourite: number;            // 0 | 1  — SQLite integer boolean
alarm_time: string | null;       // ISO 8601 timestamp, separate from due_date
alarm_enabled: number;           // 0 | 1
photo_dismiss_enabled: number;   // 0 | 1
photo_dismiss_tolerance: number; // 0.0–1.0, default 0.7
```

**Rationale:** `alarm_time` is deliberately separate from `due_date` — a task can have a due date without an alarm, and an alarm time may differ from the due date (e.g., alarm at 6:30 AM for a task due that day). `is_favourite` uses integer (not boolean) to match SQLite storage and the existing `is_deleted` field pattern.

**Also add to `CreateTaskPayload` and `UpdateTaskPayload`:**
```typescript
is_favourite?: number;
alarm_time?: string | null;
alarm_enabled?: number;
photo_dismiss_enabled?: number;
photo_dismiss_tolerance?: number;
```

---

#### Decision 2: SQLite Schema Migration — VERSION 1 → 2

**Decision:** Add new columns to the `tasks` table via `ALTER TABLE`. Bump `DATABASE_SCHEMA.VERSION` to `2`. Add migration logic in `DatabaseInit.initializeDatabase()`.

**Migration approach:** Check current `database_version` in `app_settings` on init. If `< 2`, run the `ALTER TABLE` statements. Safe for existing installs — `DEFAULT` values ensure no data loss.

**New columns to add to `tasks` table:**
```sql
ALTER TABLE tasks ADD COLUMN is_favourite INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN alarm_time TEXT DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN alarm_enabled INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN photo_dismiss_enabled INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN photo_dismiss_tolerance REAL DEFAULT 0.7;
```

**New indexes:**
```sql
CREATE INDEX IF NOT EXISTS idx_tasks_alarm_time ON tasks(alarm_time);
CREATE INDEX IF NOT EXISTS idx_tasks_is_favourite ON tasks(is_favourite);
```

**Migration method to add to `DatabaseInit`:**
```typescript
private async runMigrations(): Promise<void> {
  // Called in initializeDatabase() after createTables()
  // Reads current version from app_settings
  // Applies incremental ALTER TABLE statements for each version increment
  // Updates database_version in app_settings after each migration
}
```

**Rationale:** `ALTER TABLE` is non-destructive. Existing task data survives the migration. The `REAL` type for `photo_dismiss_tolerance` maps to TypeScript `number` correctly.

---

### Authentication & Navigation

#### Decision 3: Guest-Only Cold Start

**Decision:** `AppNavigator.tsx` must always route to `'Main'` on cold start. The fallback to `'Auth'` is removed for MVP 1. `loginAsGuest()` is called automatically when no existing session is found.

**New session check logic:**
```typescript
const checkSession = async () => {
  const result = await checkExistingSession();
  if (result.success && result.data) {
    // restore existing session (guest or user — both go to Main)
    dispatch(result.data.isGuest ? setGuestInfo(...) : setUserInfo(...));
  } else {
    // no session — auto-create guest session, no prompt
    await loginAsGuest();
    dispatch(setGuestInfo({ isGuest: true, ... }));
  }
  setInitialRoute('Main'); // ALWAYS Main in MVP 1
  setIsReady(true);
};
```

**`AuthStackNavigator` handling:** Keep the `Auth` stack registered in `AppNavigator` for future use. `LogInScreen` and `SignUpScreen` remain in the codebase — they are unreachable because no navigation path points to `'Auth'` in MVP 1.

**Rationale:** Satisfies FR2, FR3, Story 1.2 without deleting working code. MVP 2 (user accounts) re-enables the `Auth` route in `AppNavigator` — zero other changes required.

---

### Alarm Architecture

#### Decision 4: Separate `task-alarms` Notification Channel

**Decision:** Create a dedicated `task-alarms` Notifee channel with settings tuned for alarm use. The existing `task-reminders` channel remains for non-alarm notifications.

```typescript
// Add to notificationService.initialize():
await notifee.createChannel({
  id: 'task-alarms',
  name: 'Task Alarms',
  importance: AndroidImportance.HIGH,
  sound: 'default',
  vibration: true,
  vibrationPattern: [300, 500],
});
```

**Rationale:** Separate channels allow users to control alarm vs reminder notifications independently in Android settings. Required for `fullScreenAction` (lock screen wake) targeting.

---

#### Decision 5: Exact Alarm API + Android Reliability

**Decision:** Add `scheduleAlarmNotification()` to `notificationService`. Use `alarmManager: true` on `TimestampTrigger`, route to `task-alarms` channel, include `fullScreenAction`.

```typescript
scheduleAlarmNotification: async (task: Task): Promise<string | null> => {
  if (!task.alarm_time || !task.alarm_enabled) return null;

  const alarmDate = new Date(task.alarm_time);
  if (alarmDate <= new Date()) return null;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: alarmDate.getTime(),
    alarmManager: {
      allowWhileIdle: true, // fires even in Android Doze mode
    },
  };

  return await notifee.createTriggerNotification(
    {
      id: `alarm_${task.local_id}`,
      title: '⏰ TaskBell Alarm',
      body: task.title,
      android: {
        channelId: 'task-alarms',
        importance: AndroidImportance.HIGH,
        fullScreenAction: { id: 'default' }, // wakes lock screen
        pressAction: { id: 'default' },
        smallIcon: 'ic_launcher',
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: { alert: true, sound: true, badge: true },
        critical: true, // bypasses Do Not Disturb
      },
      data: {
        taskId: task.local_id,
        screen: 'AlarmDismiss', // ← new routing key
      },
    },
    trigger,
  );
},
```

**`AndroidManifest.xml` additions required:**
```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

---

#### Decision 6: Notification Routing to `AlarmDismissScreen`

**Decision:** Update `AppNavigator.tsx` `handleNotificationPress` to read the `screen` field from notification data.

```typescript
const handleNotificationPress = (taskId: string, screen?: string) => {
  if (!navigationRef.current) return;
  if (screen === 'AlarmDismiss') {
    navigationRef.current.navigate('Main', {
      screen: 'Tasks',
      params: { screen: 'AlarmDismiss', params: { taskId } },
    });
  } else {
    // default: open task editor
    navigationRef.current.navigate('Main', {
      screen: 'Tasks',
      params: { screen: 'CreateTask', params: { taskId } },
    });
  }
};
```

Apply same `screen` param read from `detail.notification.data.screen` and `initialNotification.notification.data.screen`.

---

### New Screen: AlarmDismissScreen

#### Decision 7: `AlarmDismissScreen` in `TasksStackNavigator`

**Decision:** Add `AlarmDismissScreen` to `TasksStackNavigator`. Receives `taskId` as route param.

**Navigation registration:**
```typescript
// In TasksStackNavigator — add after CreateTask:
<Stack.Screen name="AlarmDismiss" component={AlarmDismissScreen} />
```

**TypeScript param list — add to tasks stack types:**
```typescript
AlarmDismiss: { taskId: string };
```

**Screen responsibilities:**
1. Load task from SQLite by `taskId` on mount
2. If `photo_dismiss_enabled === 0`: show "Dismiss" button → `alarmDismissService.dismissAlarm(task)`
3. If `photo_dismiss_enabled === 1`: camera UI → `imageService.pickImageFromCamera()` → `alarmDismissService.validatePhoto()` → on pass: `dismissAlarm()`; on fail: retry prompt
4. If task not found (deleted while alarm pending): show message + navigate back — no crash
5. All operations: SQLite + Redux only, zero network calls

**Custom hook:** `src/presentation/hooks/useAlarmDismiss.ts`
- Thin-screen / fat-hook pattern (matches all existing screens)
- Manages: task load, camera activation, validation result, dismiss action

---

### New Service: `alarmDismissService`

#### Decision 8: Photo Validation — Histogram Similarity (Pure JS)

**Decision:** Lightweight histogram-based image similarity in a new Application layer service. No new native dependencies.

**File:** `src/application/services/tasks/alarmDismissService.ts`

**Interface:**
```typescript
export const alarmDismissService = {
  validatePhoto: async (
    capturedBase64: string,
    tolerance: number,
  ): Promise<{ passed: boolean; score: number }> => {
    // 1. Decode base64 to pixel array
    // 2. Compute grayscale histogram (256 buckets)
    // 3. Check minimum brightness threshold (not blank/too dark)
    // 4. Return passed: score >= tolerance
  },

  dismissAlarm: async (task: Task, dispatch: AppDispatch): Promise<void> => {
    // 1. Cancel @notifee notification: cancelTaskNotification(task.local_id)
    //    AND cancelNotification('alarm_' + task.local_id)
    // 2. Update task status to 'completed' in SQLite (via tasksService)
    // 3. Dispatch Redux updateTask action
    // 4. Do NOT enqueue sync operation — guest mode, no server
  },
};
```

**MVP 1 validation scope:** Validates that a real photo was taken (not blank/black/too dark). Full subject-matching against a pre-set reference photo is deferred to post-MVP 1 — it requires a reference capture UX step. The `photo_dismiss_tolerance` field and `validatePhoto()` interface support this upgrade transparently without breaking changes.

**Rationale:** Zero new native deps, no App Store review risk, sufficient for MVP 1 "prove you did it" contract.

---

### Infrastructure: Battery Optimisation

#### Decision 9: One-Time Battery Optimisation Exemption Request (Android)

**Decision:** New Infrastructure utility at `src/infrastructure/utils/batteryOptimisationService.ts`. Android-only. Uses `Linking` to open the system battery optimisation settings. Tracks whether already prompted via `app_settings` table (`battery_opt_prompted` key).

```typescript
export const batteryOptimisationService = {
  requestExemptionIfNeeded: async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    const prompted = await hasBeenPrompted(); // reads app_settings
    if (prompted) return;
    await Linking.openSettings(); // opens battery optimisation settings
    await markAsPrompted(); // sets battery_opt_prompted = 'true' in app_settings
  },
};
```

**Trigger:** Called from `notificationService.scheduleAlarmNotification()` on first alarm scheduling.
**Storage:** `app_settings` table already exists — no schema change needed for this key.

---

### Sync System

#### Decision 10: Sync Dormancy Guard Pattern

**Decision:** Add `isGuest` guard at the entry point of `syncProcessor.ts` and any function that calls server APIs. Sync infrastructure stays in the codebase, fully intact — it does nothing in guest mode.

```typescript
// syncProcessor.ts processQueue() — add at top:
const authState = store.getState().auth;
if (authState.isGuest) return; // Sync disabled in guest mode
```

**Apply same guard to:**
- `recoverDataService.ts`
- `tasksService.ts` — `createTask`, `updateTask`, `deleteTask` server-path branches
- `imageService.uploadImage()`

**Rationale:** This is a guard, not a removal. MVP 2 user accounts: remove the guard, sync re-activates with zero other changes.

---

## Implementation Patterns & Consistency Rules

### Naming Patterns

**New files follow existing conventions exactly:**

| Type | Convention | Example |
|------|-----------|---------|
| Screen | `PascalCase` + `Screen` suffix | `AlarmDismissScreen.tsx` |
| Hook | `camelCase` + `use` prefix | `useAlarmDismiss.ts` |
| Service | `camelCase` + `Service` suffix | `alarmDismissService.ts`, `batteryOptimisationService.ts` |
| SQLite column | `snake_case` | `alarm_time`, `is_favourite`, `photo_dismiss_enabled` |
| Notification ID | `alarm_${local_id}` | `alarm_local_1234_abc` |

**Navigation screen name — must be identical everywhere:**
```typescript
'AlarmDismiss'  // TasksStackNavigator registration, navigation types, notification data.screen value
```

### Structure Patterns

**All new files go in existing layer directories — no new directories:**
```
src/application/services/tasks/alarmDismissService.ts       NEW
src/infrastructure/utils/batteryOptimisationService.ts      NEW
src/presentation/screens/AlarmDismissScreen.tsx             NEW
src/presentation/hooks/useAlarmDismiss.ts                   NEW
```

**Service export pattern — named constant (not class):**
```typescript
// ✅ correct
export const alarmDismissService = { validatePhoto, dismissAlarm };
// ❌ wrong
export class AlarmDismissService { ... }
```

### Format Patterns

- **SQLite booleans:** `INTEGER DEFAULT 0`. Read as `field === 1` in TypeScript.
- **Alarm time storage:** ISO 8601 string in SQLite, same as `due_date`. Convert to `Date` for Notifee timestamp.
- **Photo data in memory:** `base64` string without `data:` prefix. `imageService.pickImageFromCamera()` already returns this format.
- **Notification data payload:**
  ```typescript
  data: { taskId: string; screen: 'AlarmDismiss' | 'CreateTask' }
  ```

### Communication Patterns

**Order of operations for alarm scheduling (must be followed exactly):**
1. Validate input (domain validator)
2. Redux optimistic update
3. SQLite write (transaction)
4. Schedule @notifee notification
5. On any failure: rollback Redux, cancel notification if scheduled

**Alarm cancellation — must cancel BOTH notification IDs:**
```typescript
await notificationService.cancelTaskNotification(task.local_id);      // due-date reminder
await notifee.cancelNotification(`alarm_${task.local_id}`);           // alarm
```
**This is required on:** task delete, task complete, alarm disabled toggle.

### Process Patterns

**`AlarmDismissScreen` state machine:**
```typescript
type AlarmDismissState =
  | 'loading'      // task loading from SQLite
  | 'ready'        // task loaded, waiting for user
  | 'capturing'    // camera active
  | 'validating'   // photo being checked
  | 'success'      // alarm dismissed
  | 'error';       // unrecoverable — show message, back button
```

**Error handling:** Every error state shows a user-visible message + back button. Never a blank screen. Never an unhandled crash.

**All AI Agents MUST:**
- Never call `@notifee` directly from `AlarmDismissScreen` — use `alarmDismissService`
- Never call `DatabaseInit` directly from screens — use service layer
- Never call `uploadImageRequest` in any MVP 1 alarm flow
- Always cancel both notification IDs on task delete/complete
- Check `isGuest` before any sync or server operation

---

## Project Structure & Boundaries

### Complete MVP 1 Delta — New & Modified Files Only

```
src/
├── domain/
│   └── types/tasks/
│       └── TaskType.ts                               MODIFY — add 5 new fields to Task, CreateTaskPayload, UpdateTaskPayload
│
├── application/
│   └── services/
│       ├── tasks/
│       │   ├── alarmDismissService.ts                NEW
│       │   └── tasksService.ts                       MODIFY — isGuest sync guard
│       └── notifications/
│           └── notificationService.ts                MODIFY — task-alarms channel + scheduleAlarmNotification() + cancel alarm ID
│
├── infrastructure/
│   ├── storage/
│   │   ├── DatabaseSchema.ts                         MODIFY — 5 new columns, 2 new indexes, VERSION=2
│   │   └── DatabaseInit.ts                           MODIFY — add runMigrations()
│   └── utils/
│       └── batteryOptimisationService.ts             NEW
│
└── presentation/
    ├── screens/
    │   └── AlarmDismissScreen.tsx                    NEW
    ├── hooks/
    │   └── useAlarmDismiss.ts                        NEW
    └── navigation/
        ├── AppNavigator.tsx                          MODIFY — guest auto-init + alarm screen routing
        └── TasksStackNavigator.tsx                   MODIFY — register AlarmDismiss screen

android/app/src/main/AndroidManifest.xml              MODIFY — 6 new permissions
```

### Architectural Boundaries

**Alarm dismiss data flow (layer direction must be respected):**
```
AlarmDismissScreen
    ↓ (hook only)
useAlarmDismiss
    ↓
alarmDismissService (Application)   — photo validation + task completion
notificationService (Application)   — cancel notification
tasksService (Application)          — mark complete in SQLite + Redux
    ↓
imageStorage (Infrastructure)       — local image file access
DatabaseInit (Infrastructure)       — SQLite operations
@notifee (Infrastructure)           — notification cancellation
```

**What `AlarmDismissScreen` MUST NOT call directly:**
`@notifee`, `DatabaseInit`, `imageStorage`, any API request function

### Epic-to-Structure Mapping

| Epic | Primary Files |
|------|--------------|
| Epic 1 — Identity & Launch | `AppNavigator.tsx` (guest init), platform icon/splash assets (no source code) |
| Epic 2 — Task Planning | `TaskType.ts`, `DatabaseSchema.ts`, `DatabaseInit.ts`, `tasksService.ts`, `tasksSQLiteService.ts` |
| Epic 3 — Alarm + Photo | `AlarmDismissScreen.tsx`, `useAlarmDismiss.ts`, `alarmDismissService.ts`, `notificationService.ts`, `TasksStackNavigator.tsx`, `AppNavigator.tsx` |
| Epic 4 — Android OEM | `batteryOptimisationService.ts`, `notificationService.ts`, `AndroidManifest.xml` |

### Data Flow Diagrams

**Alarm creation:**
```
CreateTaskScreen
  → useTaskEditor (validation via domain/validators)
  → tasksService.createTask() / updateTask()
      → SQLite transaction (DatabaseInit)
      → Redux dispatch (optimistic)
      → notificationService.scheduleAlarmNotification()
          → batteryOptimisationService.requestExemptionIfNeeded() [Android, first time]
          → notifee.createTriggerNotification() [exact alarm, task-alarms channel]
```

**Alarm dismiss (notification tap → photo → done):**
```
Notification tap
  → AppNavigator.handleNotificationPress(taskId, 'AlarmDismiss')
  → TasksStackNavigator → AlarmDismissScreen { taskId }
  → useAlarmDismiss.loadTask() → SQLite
  → [photo_dismiss_enabled = 1] → imageService.pickImageFromCamera()
  → alarmDismissService.validatePhoto(base64, tolerance)
  → [passed] → alarmDismissService.dismissAlarm(task, dispatch)
      → notifee.cancelNotification('alarm_' + task.local_id)
      → tasksService.completeTask() → SQLite + Redux
```

---

## Architecture Validation Results

### Coherence Validation ✅

All decisions use the existing technology stack. No version conflicts introduced. New columns are backward-compatible (`ALTER TABLE` with `DEFAULT`). New notification channel is additive. `alarmManager: true` is supported by `@notifee ^9.1.8`.

All new services follow the `export const serviceName = { ... }` pattern. All new files follow existing naming conventions. Dependency direction (Presentation → Application → Infrastructure → Domain) is preserved without exception.

### Requirements Coverage ✅

| FR | Decision |
|----|----------|
| FR1 | Platform icon/splash assets — implementation task |
| FR2 | Decision 3 — guest auto-init |
| FR3 | Decision 3 — AuthStack unreachable |
| FR4–FR9 | Decision 1 + Decision 2 |
| FR10 | Existing `due_date` field + UI implementation |
| FR11 | Decision 1 — `alarm_time` + `alarm_enabled` |
| FR12 | Decision 5 — `scheduleAlarmNotification()` |
| FR13 | Decision 6 — `AlarmDismiss` routing |
| FR14 | Decision 6 + existing `setTimeout` cold-start pattern |
| FR15 | Decision 1 — `photo_dismiss_enabled` |
| FR16 | Decision 7 — `AlarmDismissScreen` enforces capture |
| FR17 | Decision 8 — configurable tolerance |
| FR18 | Decision 9 — `batteryOptimisationService` |
| FR19 | Decision 5 — `alarmManager: true` + exact alarm permissions |
| FR20 | Decision 10 — `isGuest` sync guard |

**All 7 NFRs covered** — see Cross-Cutting Concerns and Process Patterns above.

### Gap Analysis

**No critical gaps.** All 20 FRs and 7 NFRs are architecturally supported.

**One deferred scope item (documented, not a gap):** Full reference-photo subject-matching for photo-dismiss is deferred to post-MVP 1. MVP 1 validates that a real, non-blank photo was taken. The `validatePhoto()` interface and `photo_dismiss_tolerance` field are future-proof for this upgrade.

### Architecture Completeness Checklist

- [x] All 20 FRs mapped to architectural decisions
- [x] All 7 NFRs addressed
- [x] Technical constraints respected (no new native deps, ALTER TABLE migration)
- [x] Cross-cutting concerns documented
- [x] 10 decisions with rationale
- [x] No breaking changes to existing patterns
- [x] Naming conventions confirmed (follow existing)
- [x] Layer boundary rules preserved
- [x] Data flows diagrammed
- [x] Epic-to-file mapping complete

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High** — brownfield codebase is well-structured; all decisions extend existing patterns; no new native dependencies; migration is non-destructive.

**Key Strengths:**
- Zero major architectural changes — implementation risk is low
- Existing Clean Architecture handles all new features naturally
- All required libraries already installed (`@notifee`, `react-native-image-picker`)
- SQLite migration is incremental and data-safe
- Sync infrastructure preserved intact for MVP 2

**Post-MVP 1 Enhancements (ready when needed):**
- Reference photo subject-matching in `alarmDismissService`
- User accounts + cloud sync (infrastructure fully built, just guarded)
- Conflict resolution (diff-match-patch already installed)

---

## Implementation Handoff

### AI Agent Rules — Read Before Writing Code

1. Read `_bmad-output/project-context.md` (63 rules) before writing any code
2. Use `ALTER TABLE` for schema migration — never `DROP TABLE`
3. Always cancel BOTH `task.local_id` AND `alarm_${task.local_id}` notification IDs on task delete/complete
4. `AlarmDismissScreen` must never call `@notifee`, `DatabaseInit`, or API requests directly
5. Every Application layer function with a server call path must check `isGuest` first
6. `photo_dismiss_tolerance` default is `0.7` — stored on the Task record; not hardcoded in service logic
7. `alarm_time` and `due_date` are independent fields — never assume they are the same value
8. All new SQLite writes use `transaction()` — never direct `executeSql` for writes

### Recommended Implementation Order

1. `DatabaseSchema.ts` + `DatabaseInit.ts` — schema migration ← unblocks everything
2. `TaskType.ts` — domain type extension ← unblocks service + UI work
3. `AppNavigator.tsx` — guest cold start ← unblocks app launch testing
4. Platform icon + splash screen assets — no code changes needed
5. Task CRUD + favourites UI — extend existing `tasksService` + `tasksSQLiteService`
6. `notificationService.ts` — new channel + `scheduleAlarmNotification()`
7. `AlarmDismissScreen.tsx` + `useAlarmDismiss.ts` + `alarmDismissService.ts`
8. `AppNavigator.tsx` — alarm notification routing update
9. `batteryOptimisationService.ts` + `AndroidManifest.xml` permissions
10. `isGuest` sync guards — audit `syncProcessor`, `tasksService`, `imageService`, `recoverDataService`
