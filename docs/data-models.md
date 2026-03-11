# Data Models — TaskBell

> **Scan Level:** Quick (pattern-based)
> **Storage Engine:** SQLite (`react-native-sqlite-storage` v6.0.1 + patch-package fix)
> **Schema Files:** `src/infrastructure/storage/DatabaseSchema.ts`, `DatabaseInit.ts`
> **Generated:** 2026-03-10

---

## Overview

TaskBell uses SQLite as its primary local database, implementing an **offline-first** data model. All task data is stored locally first, with a sync queue table managing server synchronisation.

---

## Domain Types

### Task (`src/domain/types/tasks/TaskType.ts`)

The core entity of the application.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (server-assigned on sync) |
| `title` | string | Task title |
| `description` | string (optional) | Task description |
| `status` | string | Task status (e.g., pending, completed) |
| `tags` | string[] | Category tags for organisation |
| `dueDate` | string (optional) | ISO date string for due date |
| `image` | string (optional) | Local path or remote URL of attached image |
| `createdAt` | string | ISO timestamp of creation |
| `updatedAt` | string | ISO timestamp of last update |

### Sync Types (`src/domain/types/tasks/SyncTypes.ts`)

Describes sync queue entries stored in SQLite.

| Field | Type | Description |
|---|---|---|
| `id` | number | Auto-incremented queue entry ID |
| `operation` | string | `CREATE`, `UPDATE`, `DELETE` |
| `taskId` | string | ID of the task this operation targets |
| `payload` | string | JSON-serialised task data |
| `status` | string | `pending`, `failed` |
| `createdAt` | string | ISO timestamp — used for FIFO ordering |
| `retryCount` | number | Number of failed retry attempts |

### Image Types (`src/domain/types/tasks/ImageTypes.ts`)

Describes image attachment metadata.

| Field | Type | Description |
|---|---|---|
| `uri` | string | Local file URI |
| `type` | string | MIME type (e.g., `image/jpeg`) |
| `name` | string | File name |

---

## Auth Types

### LoginType (`src/domain/types/auth/LoginType.ts`)

| Field | Type | Description |
|---|---|---|
| `email` | string | User email |
| `password` | string | User password |

### SignUpType (`src/domain/types/auth/SignUpType.ts`)

| Field | Type | Description |
|---|---|---|
| `name` | string | Display name |
| `email` | string | User email |
| `password` | string | User password |

### GuestUser (`src/domain/types/auth/GuestUser.ts`)

| Field | Type | Description |
|---|---|---|
| `isGuest` | boolean | Whether the user is in guest mode |
| `sessionId` | string | Local-only session identifier |

---

## Redux State Types

### AuthState (`src/domain/types/store/AuthState.ts`)

| Field | Type | Description |
|---|---|---|
| `user` | object \| null | Authenticated user data |
| `isGuest` | boolean | Guest mode flag |
| `token` | string \| null | Auth token for API calls |
| `isLoading` | boolean | Loading state for auth operations |
| `error` | string \| null | Auth error message |

### TasksState (`src/domain/types/store/TasksState.ts`)

| Field | Type | Description |
|---|---|---|
| `tasks` | Task[] | List of all tasks |
| `isLoading` | boolean | Loading state |
| `error` | string \| null | Error message |
| `syncStatus` | object | Pending/failed operation counts |
| `currentPage` | number | Pagination cursor |
| `hasMore` | boolean | Whether more pages exist |

---

## SQLite Database

### Initialisation

`src/infrastructure/storage/DatabaseInit.ts` — Opens/creates the SQLite database on app start and runs schema migrations if needed.

### Schema

`src/infrastructure/storage/DatabaseSchema.ts` — Defines all table DDL statements.

**Inferred Tables (from service file patterns):**

#### `tasks`
Local task storage, mirrors server data.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PRIMARY KEY | Server-assigned or local temp ID |
| `title` | TEXT | Task title |
| `description` | TEXT | Optional description |
| `status` | TEXT | Task status |
| `tags` | TEXT | JSON-serialised tags array |
| `dueDate` | TEXT | ISO date string |
| `image` | TEXT | Image path/URL |
| `createdAt` | TEXT | ISO timestamp |
| `updatedAt` | TEXT | ISO timestamp |

#### `sync_queue`
Offline operations awaiting server sync. FIFO processed.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Queue order |
| `operation` | TEXT | `CREATE`, `UPDATE`, `DELETE` |
| `taskId` | TEXT | Target task ID |
| `payload` | TEXT | JSON-serialised task snapshot |
| `status` | TEXT | `pending` or `failed` |
| `createdAt` | TEXT | Used for FIFO ordering |
| `retryCount` | INTEGER | Incremented on failure |

#### `user_session`
Persists auth session across app restarts.

Managed by: `src/infrastructure/storage/userSessionStorage.ts`

| Column | Type | Notes |
|---|---|---|
| `userId` | TEXT | User ID or guest session ID |
| `token` | TEXT | Auth token |
| `isGuest` | INTEGER | 0 = authenticated, 1 = guest |

---

## Local Image Storage

`src/infrastructure/storage/imageStorage.ts`

Manages local device storage for task image attachments. Stores images in the app's document directory, tracks path references in the `tasks` table.

---

## Validation

`src/domain/validators/`

| Validator | File | Rules |
|---|---|---|
| Login | `loginValidator.ts` | Email format, password min length |
| Sign Up | `signupValidator.ts` | Name required, email format, password strength |
| Task | `taskValidator.ts` | Title required, due date format |

---

## Conflict Resolution (Prepared, Not Active)

`src/application/services/tasks/conflictResolutionService.ts`

Infrastructure for 3-way merge using `diff-match-patch`. Currently inactive as tasks are single-user. Activates when collaborative editing is supported by the backend.

| Strategy | Description |
|---|---|
| `last-write-wins` | Current active strategy — timestamp-based |
| `merge` | 3-way text merge — prepared for multi-user |
