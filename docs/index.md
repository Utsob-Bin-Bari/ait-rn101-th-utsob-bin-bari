# TaskBell — Project Documentation Index

> **Generated:** 2026-03-10
> **Project Type:** Mobile (React Native — iOS + Android)
> **Architecture:** Clean / Layered Architecture
> **Repository Type:** Monolith

---

## Project Overview

- **Name:** TaskBell
- **Type:** React Native Mobile App (Bare Workflow)
- **Primary Language:** TypeScript
- **Architecture Pattern:** Clean / Layered Architecture (Domain → Application → Infrastructure ↔ Presentation)
- **Entry Point:** `index.js` → `App.tsx` → `AppNavigator.tsx`

### Quick Reference

| Category | Detail |
|---|---|
| **Tech Stack** | React Native 0.82.1, TypeScript, Redux Toolkit, SQLite, React Navigation v7 |
| **Platforms** | iOS + Android |
| **State Management** | Redux Toolkit (authReducer, tasksReducer) |
| **Local Storage** | SQLite — tasks, sync_queue, user_session tables |
| **Backend (dev)** | json-server on port 3000 |
| **Notifications** | @notifee/react-native + deep linking (`taskbell://`) |
| **Offline Strategy** | FIFO sync queue in SQLite, optimistic UI updates |
| **Tests** | Jest — 9 sync queue tests (all passing) |
| **Package Manager** | Yarn (Node ≥ 20) |

---

## Generated Documentation

| Document | Description |
|---|---|
| [Project Overview](./project-overview.md) | Summary, features, tech stack, getting started |
| [Architecture](./architecture.md) | Full technical architecture, patterns, data flow, design decisions |
| [Source Tree Analysis](./source-tree-analysis.md) | Annotated directory tree with all files explained |
| [API Contracts](./api-contracts.md) | REST endpoints, sync queue architecture, request files |
| [Data Models](./data-models.md) | SQLite schema, TypeScript types, domain entities |
| [Component Inventory](./component-inventory.md) | All UI components, screens, hooks, design system |
| [Development Guide](./development-guide.md) | Setup, scripts, local dev, testing, common tasks |
| [Deployment Guide](./deployment-guide.md) | Android/iOS builds, backend config, deep linking |

---

## Existing Documentation

| Document | Description |
|---|---|
| [README.md](../README.md) | Comprehensive project README — features, architecture rationale, setup, build, testing |

---

## Getting Started

```bash
# 1. Install dependencies
yarn install

# 2. iOS setup (macOS only)
yarn pod-start

# 3. Start mock API server (separate terminal)
yarn server

# 4. Run app
yarn android    # or yarn ios
```

**Physical device (no server needed):** Launch app → tap **"Continue as Guest"**

---

## Key Files for AI-Assisted Development

| Task | Key Files to Reference |
|---|---|
| Adding a screen | `src/presentation/screens/`, `src/presentation/navigation/` |
| Adding an API endpoint | `src/infrastructure/api/endpoints/`, `src/infrastructure/api/requests/` |
| Adding business logic | `src/application/services/` |
| Changing data models | `src/domain/types/`, `src/infrastructure/storage/DatabaseSchema.ts` |
| Adding Redux state | `src/application/store/action/`, `src/application/store/reducer/` |
| Adding a component | `src/presentation/component/` |
| Sync/offline behaviour | `src/application/services/tasks/syncProcessor.ts` |
| Notifications | `src/application/services/notifications/notificationService.ts` |
| API base URL (device config) | `src/infrastructure/api/config/apiConfig.ts` |
