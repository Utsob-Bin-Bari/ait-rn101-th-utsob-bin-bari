# Architecture — TaskBell

> **Generated:** 2026-03-10
> **Project Type:** Mobile (React Native, iOS + Android)
> **Pattern:** Clean / Layered Architecture

---

## Executive Summary

TaskBell is a React Native (bare workflow) task management application built on an **offline-first, Clean Architecture** foundation. The codebase is organised into four strictly separated layers — Domain, Application, Infrastructure, and Presentation — with unidirectional dependency flow. SQLite provides durable local storage, Redux manages in-memory state with optimistic updates, and a FIFO sync queue handles reliable server synchronisation when network is available.

---

## Architecture Pattern

**Clean / Layered Architecture** with 4 layers and strict dependency direction:

```
Presentation  →  Application  →  Infrastructure
      ↓               ↓
    Domain  ←  (types, validators only)
```

| Layer | Responsibility | Can Depend On |
|---|---|---|
| **Domain** | Types, validation rules, pure business rules | Nothing |
| **Application** | Services, Redux store, business logic | Domain |
| **Infrastructure** | SQLite, API, file storage, network utils | Domain |
| **Presentation** | Screens, components, navigation, UI hooks | Application, Domain |

---

## Technology Stack

| Category | Technology | Version |
|---|---|---|
| Runtime | React Native (Bare) | 0.82.1 |
| Language | TypeScript | ^5.8.3 |
| UI Framework | React | 19.1.1 |
| State Management | Redux Toolkit + React Redux | ^2.10.1 / ^9.2.0 |
| Navigation | React Navigation (Stack + Bottom Tabs) | v7 |
| Local Database | react-native-sqlite-storage | ^6.0.1 |
| HTTP Client | Axios | ^1.13.2 |
| Notifications | @notifee/react-native | ^9.1.8 |
| Animations | react-native-reanimated | ^4.1.3 |
| Gestures | react-native-gesture-handler | ^2.29.1 |
| Images | react-native-image-picker | ^8.2.1 |
| Audio | react-native-sound | ^0.11.2 |
| File System | react-native-fs | ^2.20.0 |
| Image Resizing | react-native-image-resizer | ^3.0.10 |
| SVG | react-native-svg | ^15.14.0 |
| Network Detection | @react-native-community/netinfo | ^11.4.1 |
| Mock Backend | json-server | ^0.17.4 |
| Testing | Jest + @testing-library/react-native | ^29 / ^13 |
| Package Manager | Yarn | — |

---

## Layer Details

### 1. Domain Layer (`src/domain/`)

The innermost layer — pure TypeScript with zero runtime dependencies.

**Types (`src/domain/types/`):**
- `tasks/TaskType.ts` — Core Task entity, including:
  - `photo_dismiss_ref_path: string | null` — permanent file path to the reference photo captured at task creation; present in `Task`, `CreateTaskPayload`, and `UpdateTaskPayload`
  - `photo_dismiss_tolerance: number` — Hamming-distance tolerance threshold (0–1, default 0.7, mapped to ≤ 19/64 bits) for photo comparison
- `tasks/SyncTypes.ts` — Sync queue entry shape
- `tasks/ImageTypes.ts` — Image attachment metadata
- `auth/LoginType.ts`, `SignUpType.ts`, `GuestUser.ts` — Auth payloads
- `store/AuthState.ts`, `TasksState.ts` — Redux state shapes

**Validators (`src/domain/validators/`):**
- `loginValidator.ts` — Email format + password rules
- `signupValidator.ts` — Registration field rules
- `taskValidator.ts` — Task field rules (title required, date format)

---

### 2. Application Layer (`src/application/`)

Business logic and state orchestration. No I/O — depends only on Domain.

**Services (`src/application/services/`):**

| Service | Responsibility |
|---|---|
| `auth/login/` | Login flow orchestration |
| `auth/signup/` | Registration flow |
| `auth/logout/` | Logout + session cleanup |
| `auth/loginAsGuest.ts` | Guest session creation (local-only) |
| `auth/convertGuestToUser.ts` | Migrate guest data to authenticated account |
| `auth/storeGuestSession.ts` | Persist guest session in SQLite |
| `tasks/tasksService.ts` | Task CRUD business logic |
| `tasks/tasksSQLiteService.ts` | SQLite task persistence |
| `tasks/taskEditorService.ts` | Task create/edit orchestration |
| `tasks/syncProcessor.ts` | FIFO sync queue processor ← **Core sync engine** |
| `tasks/syncQueueService.ts` | Queue CRUD operations |
| `tasks/syncCleanupService.ts` | Completed entry removal |
| `tasks/syncDebugService.ts` | Debug utilities |
| `tasks/imageService.ts` | Image upload + local file management |
| `tasks/paginationService.ts` | Pagination cursor logic |
| `tasks/searchFilterService.ts` | Search + filter operations |
| `tasks/conflictResolutionService.ts` | 3-way merge (prepared, inactive — single-user) |
| `notifications/notificationService.ts` | Schedule/cancel @notifee notifications |
| `notifications/alarmAudioService.ts` | `play()` / `stop()` looping alarm audio via react-native-sound — **never called directly from screens; always via `useAlarmAudio` hook** |
| `photoComparisonService.ts` | Offline pHash comparison: resize both images → compute difference hash → Hamming distance check against `photo_dismiss_tolerance` |
| `settings/clearDataService.ts` | Wipe all local app data |
| `settings/recoverDataService.ts` | Restore data from server |

**Redux Store (`src/application/store/`):**

```
store.ts              ← Redux store configuration
initialState.ts       ← Default state values
reducer/
  rootReducer.ts      ← combineReducers
  authReducer.ts      ← Authentication state
  tasksReducer.ts     ← Tasks + sync state
action/
  auth/               ← Auth action creators
  tasks/              ← Task action creators
  store/              ← Store-level actions
```

---

### 3. Infrastructure Layer (`src/infrastructure/`)

I/O adapters — API, database, file system, network.

**API (`src/infrastructure/api/`):**
- `config/apiConfig.ts` — Axios instance + base URL (env-aware)
- `endpoints/AuthEndpoints.ts`, `TaskEndpoints.ts` — Path constants
- `hooks/useApi.ts` — React hook wrapping Axios
- `requests/auth/` — `loginRequest.ts`, `signUpRequest.ts`
- `requests/tasks/` — `createTaskRequest.ts`, `fetchTasksRequest.ts`, `updateTaskRequest.ts`, `deleteTaskRequest.ts`, `uploadImageRequest.ts`

**Storage (`src/infrastructure/storage/`):**
- `DatabaseInit.ts` — Opens SQLite DB, runs schema initialisation
- `DatabaseSchema.ts` — Table DDL: `tasks`, `sync_queue`, `user_session`
- `userSessionStorage.ts` — Session persistence (auth token, guest flag)
- `imageStorage.ts` — Local image file management
- `imageStorageService.ts` — `saveReferencePhoto(taskId, tempUri): Promise<string>` copies temp URI to permanent app storage via RNFS; `deleteReferencePhoto(taskId): Promise<void>` removes the file

**Utils (`src/infrastructure/utils/`):**
- `NetworkService.ts` — `@react-native-community/netinfo` wrapper
- `notificationPermission.ts` — @notifee permission request

---

### 4. Presentation Layer (`src/presentation/`)

UI only — screens, components, navigation, hooks. No business logic.

**Screens (8):**
- `LogInScreen.tsx`, `SignUpScreen.tsx` — Auth flow
- `HomeScreen.tsx` — Dashboard with task stats
- `AllTasksScreen.tsx` — Task list with search + filter
- `CreateTaskScreen.tsx` — Task create / edit form (captures reference photo when photo-dismiss enabled)
- `SettingScreen.tsx` — App settings + data management
- `SyncManagementScreen.tsx` — Sync queue viewer + manual controls
- `AlarmDismissScreen.tsx` — Full-screen alarm dismiss UI; plays looping audio on mount via `useAlarmAudio`; handles Dismiss (with optional photo comparison) and Snooze; **audio must fully stop before any navigation call**

**Components (16 + 13 SVGs):** See [component-inventory.md](./component-inventory.md)

**Navigation:**
```
AppNavigator (Stack — root)
├── AuthStackNavigator (Stack)
│   ├── LogInScreen
│   └── SignUpScreen
├── AlarmDismissScreen  ← modal, pushed by notification deep link (taskbell://alarm-dismiss)
└── TabNavigator (Bottom Tabs)
    ├── HomeStackNavigator → HomeScreen
    ├── TasksStackNavigator → AllTasksScreen, CreateTaskScreen
    └── SettingsStackNavigator → SettingScreen, SyncManagementScreen
```

**Custom Hooks (7):** `useLogin`, `useSignup`, `useTasks`, `useTaskEditor`, `useSettings`, `useSyncManagement`, `useAlarmAudio`

> `useAlarmAudio` — sole permitted caller of `alarmAudioService`. Starts looping audio on mount, guarantees `stop()` is called in `useEffect` cleanup before the component unmounts or navigates away. Screens must never import `alarmAudioService` directly.

---

## Key Architectural Patterns

### Offline-First with FIFO Sync Queue

```
User Action
    ↓
Redux (optimistic update)        ← Instant UI response
    ↓
SQLite (write task + queue entry)  ← Durable local persistence
    ↓
NetworkService detects online
    ↓
syncProcessor.ts (FIFO)          ← Process oldest operation first
    ↓
API Request
    ├─ Success → Delete queue entry
    └─ Failure → Mark failed, stop processing (preserve order)
```

### Optimistic Updates with Rollback

1. Redux state updated immediately
2. Operation queued in SQLite
3. On sync failure: Redux state rolled back from SQLite

### Guest Mode

- Local-only SQLite session, no server interaction
- Full task CRUD works offline
- `convertGuestToUser.ts` migrates local data on account creation
- Guest data wiped on logout

### Authentication Flow

```
App Start → DatabaseInit → Check userSessionStorage
    ├─ Valid session → Main (TabNavigator)
    ├─ Guest session → Main (TabNavigator, limited)
    └─ No session → Auth (AuthStackNavigator)
```

### Notification + Deep Linking

- `notificationService.ts` schedules @notifee local notifications on task creation/update
- Notifications trigger at task due date (works when app is closed, Android reboot-safe)
- Custom URL scheme `taskbell://` routes notification taps to specific task screens
  - `taskbell://alarm-dismiss?taskId=<id>` deep-links directly to `AlarmDismissScreen`
- Permissions requested on first launch; app functions without them

**Looping Alarm Audio (Story 3.3):**
- `AlarmDismissScreen` mounts → `useAlarmAudio` hook calls `alarmAudioService.play()` with loop enabled
- On Dismiss or Snooze: `useAlarmAudio` calls `alarmAudioService.stop()` **synchronously before** any `navigation.goBack()` or `navigation.navigate()` call
- `useEffect` cleanup in `useAlarmAudio` ensures audio stops if the component is unmounted by any other means (e.g., back gesture)
- **Constraint:** `alarmAudioService` must never be imported or called directly from any screen or component — `useAlarmAudio` is the only permitted entry point

### Photo Comparison — Offline pHash (Stories 3.4 + 3.5)

All photo processing is fully offline — no network call at any step (FR20 constraint).

**Reference Photo Capture (Story 3.4 — CreateTaskScreen):**

```
User taps "Capture Reference Photo"
    ↓
react-native-image-picker → temp URI (cleared on app restart)
    ↓
imageStorageService.saveReferencePhoto(taskId, tempUri)   ← Infrastructure
    → RNFS.copyFile(tempUri, permanentPath)
    → returns permanentPath
    ↓
permanentPath stored in task.photo_dismiss_ref_path (SQLite v3 column)
```

**Photo Comparison at Dismiss Time (Story 3.5 — AlarmDismissScreen):**

```
User taps "Dismiss"
    ↓
react-native-image-picker → live capture → liveTempUri
    ↓
photoComparisonService.compare(refPath, liveTempUri, tolerance)   ← Application
    ↓
  Step 1: react-native-image-resizer
          resize refPath → 32×32 greyscale PNG (in-memory)
          resize liveTempUri → 32×32 greyscale PNG (in-memory)
    ↓
  Step 2: Compute difference hash (dHash) for each resized image
          → 64-bit binary string per image
    ↓
  Step 3: Hamming distance = count of differing bits (0–64)
          tolerance (0–1) maps to maxDistance = round((1 - tolerance) × 64)
          e.g. tolerance 0.7 → maxDistance ≤ 19
    ↓
  Returns { match: boolean; score: number }
    ↓
  match = true  → dismiss task, stop audio, navigate back
  match = false → show "Photo mismatch" UI, prompt retry
```

**Layer Boundaries:**

| Concern | Layer | File |
|---|---|---|
| Capture temp URI | Presentation | `AlarmDismissScreen` via `react-native-image-picker` |
| Resize + hash + compare | Application | `photoComparisonService.ts` |
| Permanent file read/write | Infrastructure | `imageStorageService.ts` |
| Tolerance threshold stored | Domain | `TaskType.ts → photo_dismiss_tolerance` |

> `photoComparisonService` does **not** import SQLite or RNFS directly. It receives file paths as arguments; Infrastructure resolves them before passing in.

---

## Data Architecture

### SQLite Tables

| Table | Purpose |
|---|---|
| `tasks` | Local task data mirror |
| `sync_queue` | Pending server operations (FIFO) |
| `user_session` | Auth token + guest flag persistence |

**Schema Migrations:**

| Version | Change |
|---|---|
| v1 | Initial schema: `tasks`, `sync_queue`, `user_session` |
| v2 | Added alarm scheduling fields: `alarm_time`, `alarm_enabled` |
| v3 | `ALTER TABLE tasks ADD COLUMN photo_dismiss_ref_path TEXT DEFAULT NULL` — permanent reference photo file path for photo-dismiss enforcement (Story 3.4) |

### State Management

| Store Slice | Contents |
|---|---|
| `auth` | User, token, isGuest, loading, error |
| `tasks` | Tasks array, pagination, sync status, loading, error |

---

## Testing Architecture

| Layer | Coverage | Framework |
|---|---|---|
| Sync queue | Unit tests (9 cases) | Jest + mocked SQLite |
| UI components | None currently | — |
| Services | None currently | — |

Test file: `__tests__/syncManagement.test.ts`

---

## Known Design Decisions & Trade-offs

| Decision | Rationale |
|---|---|
| Bare RN workflow over Expo | Smaller bundle, full native module control |
| SQLite over AsyncStorage | Structured data, complex queries, sync queue transactions |
| json-server as backend | Simple REST mock for development; easily replaced |
| last-write-wins conflict strategy | Single-user tasks — no concurrent edits possible currently |
| diff-match-patch included but inactive | Infrastructure prepared for future multi-user collaboration |
| Guest mode local-only | Enables zero-friction onboarding without backend dependency |
| react-native-sound over Expo Audio | Bare workflow; direct native module gives reliable looping without Expo runtime |
| RNFS for permanent photo storage | `react-native-image-picker` temp URIs are cleared between sessions; RNFS copy-to-documents ensures durability |
| pHash (dHash) for photo comparison | Fully offline, no ML dependency, O(1) comparison after 32×32 resize; tolerant of lighting variance unlike pixel diff |
| `useAlarmAudio` hook encapsulation | Prevents audio leak bugs — centralises lifecycle management so `stop()` is guaranteed before any navigation event |
| `photo_dismiss_tolerance` stored per-task | Enables future per-task sensitivity tuning without schema changes; default 0.7 maps to Hamming ≤ 19/64 |
