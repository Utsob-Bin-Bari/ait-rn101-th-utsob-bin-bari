# API Contracts — TaskBell

> **Scan Level:** Quick (pattern-based)
> **Backend:** JSON Server (`json-server`) on `http://0.0.0.0:3000` (development)
> **HTTP Client:** Axios (`src/infrastructure/api/config/apiConfig.ts`)
> **Generated:** 2026-03-10

---

## Base Configuration

| Setting | Value |
|---|---|
| **Dev URL (Android Emulator)** | `http://10.0.2.2:3000` |
| **Dev URL (iOS Simulator)** | `http://localhost:3000` |
| **Dev URL (Physical Device)** | `http://<YOUR_IP>:3000` |
| **Production URL** | `https://your-backend.com/api` (configurable) |
| **Config File** | `src/infrastructure/api/config/apiConfig.ts` |
| **Custom Hook** | `src/infrastructure/api/hooks/useApi.ts` |
| **Endpoint Definitions** | `src/infrastructure/api/endpoints/` |

---

## Authentication Endpoints

Defined in: `src/infrastructure/api/endpoints/AuthEndpoints.ts`
Requests in: `src/infrastructure/api/requests/auth/`

### POST /users — Sign Up
- **Request file:** `signUpRequest.ts`
- **Payload:** `{ name, email, password }` (see `src/domain/types/auth/SignUpType.ts`)
- **Response:** Created user object with session token
- **Auth required:** No

### POST /login — Log In
- **Request file:** `loginRequest.ts`
- **Payload:** `{ email, password }` (see `src/domain/types/auth/LoginType.ts`)
- **Response:** User object + auth token
- **Auth required:** No

### Guest Session
- **Service:** `src/application/services/auth/loginAsGuest.ts`
- **Mechanism:** Local-only session stored in SQLite via `userSessionStorage.ts`
- **Auth required:** No (device-local only)

### Guest → Full Account Conversion
- **Service:** `src/application/services/auth/convertGuestToUser.ts`
- **Description:** Migrates local guest data to authenticated account
- **Auth required:** Partial (creates new account)

---

## Task Endpoints

Defined in: `src/infrastructure/api/endpoints/TaskEndpoints.ts`
Requests in: `src/infrastructure/api/requests/tasks/`

### GET /tasks — Fetch All Tasks
- **Request file:** `fetchTasksRequest.ts`
- **Query params:** Supports pagination (via `paginationService.ts`)
- **Response:** Array of Task objects (see `src/domain/types/tasks/TaskType.ts`)
- **Auth required:** Yes

### POST /tasks — Create Task
- **Request file:** `createTaskRequest.ts`
- **Payload:** Task object (title, description, due date, tags, status, image)
- **Response:** Created Task object with server-assigned `id`
- **Auth required:** Yes
- **Offline behaviour:** Queued in SQLite `sync_queue`, synced when online

### PUT /tasks/:id — Update Task
- **Request file:** `updateTaskRequest.ts`
- **Payload:** Partial Task object with updated fields
- **Response:** Updated Task object
- **Auth required:** Yes
- **Offline behaviour:** Queued in SQLite `sync_queue`, optimistic UI update

### DELETE /tasks/:id — Delete Task
- **Request file:** `deleteTaskRequest.ts`
- **Payload:** Task ID
- **Response:** 200 OK
- **Auth required:** Yes
- **Offline behaviour:** Queued in SQLite `sync_queue`

### POST /upload — Upload Task Image
- **Request file:** `uploadImageRequest.ts`
- **Payload:** Multipart form data with image file
- **Response:** Image URL / reference
- **Auth required:** Yes
- **Service:** `src/application/services/tasks/imageService.ts`

---

## Sync Queue Architecture

The app uses an **offline-first FIFO sync queue** backed by SQLite.

| Aspect | Detail |
|---|---|
| **Queue table** | `sync_queue` in SQLite |
| **Processing order** | FIFO (oldest operation first) |
| **Trigger** | Network reconnect + valid auth session |
| **On failure** | Stop processing; preserve queue order |
| **Retry** | Manual retry via Sync Management screen |
| **Cleanup** | Completed operations deleted immediately |
| **Service** | `src/application/services/tasks/syncProcessor.ts` |
| **Queue service** | `src/application/services/tasks/syncQueueService.ts` |
| **Debug service** | `src/application/services/tasks/syncDebugService.ts` |

---

## API Hook

`src/infrastructure/api/hooks/useApi.ts`

Custom hook wrapping Axios for consistent error handling, loading states, and integration with Redux for auth token injection.

---

## Related Services

| Service | Location | Responsibility |
|---|---|---|
| `syncProcessor.ts` | `application/services/tasks/` | Processes sync queue operations |
| `syncQueueService.ts` | `application/services/tasks/` | Manages queue CRUD |
| `syncCleanupService.ts` | `application/services/tasks/` | Removes completed queue entries |
| `tasksService.ts` | `application/services/tasks/` | Business logic for task CRUD |
| `tasksSQLiteService.ts` | `application/services/tasks/` | SQLite persistence for tasks |
| `imageService.ts` | `application/services/tasks/` | Image upload and local storage |
| `paginationService.ts` | `application/services/tasks/` | Pagination logic |
| `searchFilterService.ts` | `application/services/tasks/` | Search and filter logic |
| `NetworkService.ts` | `infrastructure/utils/` | Online/offline detection |
