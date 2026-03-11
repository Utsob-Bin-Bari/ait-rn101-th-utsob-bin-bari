# Project Overview — TaskBell

> **Generated:** 2026-03-10

---

## Summary

**TaskBell** is a professional React Native mobile application (iOS + Android) for task management with offline-first capabilities. Users can create, manage, and track tasks with due-date notifications, image attachments, and automatic background sync — all without requiring an internet connection.

The app supports both authenticated users (with server sync) and a guest mode for zero-friction local-only usage.

---

## Core Features

| Feature | Description |
|---|---|
| **Task CRUD** | Create, read, update, delete tasks |
| **Offline-First** | Full functionality without internet; auto-syncs when online |
| **Local Notifications** | Due-date reminders via @notifee (works offline, survives reboot) |
| **Deep Linking** | Tap notification → opens specific task directly (`taskbell://`) |
| **Image Attachments** | Attach photos from camera or gallery |
| **Search & Filter** | Search by title, filter by status |
| **Pagination** | Efficient loading for large task lists |
| **Auto-Sync** | FIFO queue syncs to server automatically when online |
| **Guest Mode** | Full local functionality without account creation |
| **Auth System** | Login / Sign Up with persistent session |
| **Animations** | Swipe-to-complete, swipe-to-delete, loading animations |
| **Error Handling** | Error boundaries, user-friendly messages, optimistic rollback |

---

## Tech Stack Summary

| Category | Technology |
|---|---|
| Framework | React Native 0.82.1 (Bare, New Architecture) |
| Language | TypeScript ^5.8.3 |
| State | Redux Toolkit ^2.10.1 |
| Database | SQLite (react-native-sqlite-storage) |
| Navigation | React Navigation v7 |
| Notifications | @notifee/react-native |
| Animations | react-native-reanimated + gesture-handler |
| HTTP | Axios |
| Mock API | json-server (dev only) |
| Testing | Jest + @testing-library/react-native |

---

## Architecture Type

**Clean / Layered Architecture** — 4 layers with strict unidirectional dependencies:

```
Domain → Application → Infrastructure
                    ↕
              Presentation
```

See [architecture.md](./architecture.md) for full details.

---

## Repository Structure

```
ait-rn101-th-utsob-bin-bari/
├── src/            # All app source (Clean Architecture)
├── __tests__/      # Jest unit tests
├── android/        # Android native project
├── ios/            # iOS native project
├── patches/        # patch-package SQLite fix
├── App.tsx         # Root component
└── index.js        # Entry point
```

---

## Documentation Index

| Document | Description |
|---|---|
| [architecture.md](./architecture.md) | Full technical architecture and design decisions |
| [source-tree-analysis.md](./source-tree-analysis.md) | Annotated directory tree |
| [api-contracts.md](./api-contracts.md) | REST API endpoints and sync queue |
| [data-models.md](./data-models.md) | SQLite schema and TypeScript types |
| [component-inventory.md](./component-inventory.md) | UI component catalogue |
| [development-guide.md](./development-guide.md) | Setup, scripts, and development workflows |
| [deployment-guide.md](./deployment-guide.md) | Build and deployment instructions |

---

## Getting Started

```bash
# 1. Install dependencies
yarn install

# 2. iOS (macOS only)
yarn pod-start

# 3. Start mock API server
yarn server

# 4. Run the app
yarn android   # or yarn ios
```

For physical device setup, see [development-guide.md](./development-guide.md).
