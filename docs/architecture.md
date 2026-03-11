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
- `tasks/TaskType.ts` — Core Task entity
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

**Utils (`src/infrastructure/utils/`):**
- `NetworkService.ts` — `@react-native-community/netinfo` wrapper
- `notificationPermission.ts` — @notifee permission request

---

### 4. Presentation Layer (`src/presentation/`)

UI only — screens, components, navigation, hooks. No business logic.

**Screens (7):**
- `LogInScreen.tsx`, `SignUpScreen.tsx` — Auth flow
- `HomeScreen.tsx` — Dashboard with task stats
- `AllTasksScreen.tsx` — Task list with search + filter
- `CreateTaskScreen.tsx` — Task create / edit form
- `SettingScreen.tsx` — App settings + data management
- `SyncManagementScreen.tsx` — Sync queue viewer + manual controls

**Components (16 + 13 SVGs):** See [component-inventory.md](./component-inventory.md)

**Navigation:**
```
AppNavigator (Stack — root)
├── AuthStackNavigator (Stack)
│   ├── LogInScreen
│   └── SignUpScreen
└── TabNavigator (Bottom Tabs)
    ├── HomeStackNavigator → HomeScreen
    ├── TasksStackNavigator → AllTasksScreen, CreateTaskScreen
    └── SettingsStackNavigator → SettingScreen, SyncManagementScreen
```

**Custom Hooks (6):** `useLogin`, `useSignup`, `useTasks`, `useTaskEditor`, `useSettings`, `useSyncManagement`

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
- Permissions requested on first launch; app functions without them

---

## Data Architecture

### SQLite Tables

| Table | Purpose |
|---|---|
| `tasks` | Local task data mirror |
| `sync_queue` | Pending server operations (FIFO) |
| `user_session` | Auth token + guest flag persistence |

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
