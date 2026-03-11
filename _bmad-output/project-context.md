---
project_name: 'TaskBell'
user_name: 'Utsob'
date: '2026-03-10'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 63
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core
- React Native 0.82.1 (Bare Workflow, New Architecture enabled)
- React 19.1.1
- TypeScript ^5.8.3 (extends @react-native/typescript-config)
- Node.js ≥ 20 required

### State & Navigation
- @reduxjs/toolkit ^2.10.1
- react-redux ^9.2.0
- @react-navigation/native v7, /stack ^7.6.3, /bottom-tabs ^7.8.4

### Storage & Network
- react-native-sqlite-storage ^6.0.1 (+ patch-package fix applied via postinstall)
- axios ^1.13.2
- @react-native-community/netinfo ^11.4.1

### UI & Animation
- react-native-reanimated ^4.1.3
- react-native-gesture-handler ^2.29.1
- react-native-svg ^15.14.0
- react-native-image-picker ^8.2.1
- react-native-linear-gradient ^2.8.3
- react-native-safe-area-context ^5.6.2
- react-native-screens ^4.18.0

### Notifications
- @notifee/react-native ^9.1.8

### Dev / Build
- json-server ^0.17.4 (mock backend, dev only — port 3000)
- patch-package ^8.0.1
- prettier 2.8.8
- eslint with @react-native/eslint-config 0.82.1

### Testing
- jest ^29.6.3
- @testing-library/react-native ^13.3.3
- @testing-library/jest-native ^5.4.3

## Critical Implementation Rules

### Language-Specific Rules

#### TypeScript
- Config extends `@react-native/typescript-config` — do NOT add a custom `compilerOptions`
  block unless strictly necessary; the base config handles strictness settings
- All new files must use `.ts` (logic) or `.tsx` (JSX) extensions — never plain `.js` for src
- Custom type declarations for untyped libraries go in `src/types/` as `*.d.ts` files
  (see `diff-match-patch.d.ts`, `react-native-sqlite-storage.d.ts` as reference)
- Use explicit return types on service functions and Redux reducers
- Prefer `interface` for object shapes, `type` for unions/intersections

#### Formatting (Prettier 2.8.8)
- Single quotes: `'string'` not `"string"`
- Trailing commas everywhere: arrays, objects, function params — `trailingComma: 'all'`
- Arrow functions: omit parens for single params — `x => x` not `(x) => x`
- These rules are enforced — always match them or the linter will fail

#### Imports & Exports
- Each directory exposes a barrel `index.js` — import from the barrel, not the file directly
  - ✅ `import { syncQueueService } from '../application/services/tasks'`
  - ❌ `import { syncQueueService } from '../application/services/tasks/syncQueueService'`
- Exception: direct imports are acceptable within the same layer subfolder
- External library imports always come before internal imports

#### Async Patterns
- Use `async/await` throughout — no raw `.then()/.catch()` chains in service files
- SQLite operations use callback-based transactions (library constraint) — wrap them in
  `Promise` when exposing to service layer
- Never `await` inside a SQLite `transaction` callback — use the callback pattern directly

### Framework-Specific Rules

#### React Native
- Always wrap the root component with `GestureHandlerRootView` — required by
  react-native-gesture-handler v2; missing this causes gesture failures silently
- Use `react-native-safe-area-context` `SafeAreaView` (not RN's built-in) for screen wrappers
- `react-native-screens` is enabled — do NOT call `enableScreens(false)`
- `console.*` calls are stripped in production builds via `babel-plugin-transform-remove-console`
  — do not rely on console for error handling; use proper error boundaries
- The `react-native-worklets` Babel plugin is required in `babel.config.js` for reanimated v4
  — do not remove it or worklets will break at runtime

#### Clean Architecture — Layer Boundaries (CRITICAL)
- **Domain** (`src/domain/`) has ZERO runtime dependencies — types and validators only
- **Application** (`src/application/`) depends only on Domain — no direct SQLite/Axios calls
- **Infrastructure** (`src/infrastructure/`) handles all I/O — API, SQLite, file system
- **Presentation** (`src/presentation/`) calls Application services via hooks — never calls
  Infrastructure directly
- Violating layer boundaries (e.g., calling Axios from a screen) is an architectural error

#### Redux
- Use Redux Toolkit slices/reducers pattern — no legacy `createReducer` with switch statements
- Optimistic updates pattern: update Redux state FIRST, queue SQLite op, rollback on failure
- Do NOT fetch from API inside reducers — use service layer then dispatch actions
- `initialState.ts` is the single source of default values — do not hardcode defaults elsewhere
- Access auth token via Redux store, not from SQLite directly, in request functions

#### React Navigation v7
- Navigation types must be defined for each stack — use TypeScript param list types
- Use `useNavigation` hook inside components, not prop drilling
- Screen components must NOT contain business logic — delegate to custom hooks in
  `src/presentation/hooks/`
- Each tab has its own Stack navigator — do not add screens directly to TabNavigator

#### SQLite
- ALWAYS access the database through `DatabaseInit.getInstance().getDatabase()` —
  never open a new connection directly
- Schema changes go in `DatabaseSchema.ts`; migration logic in `DatabaseInit.ts`
- All write operations must use `transaction()` — never call `executeSql` directly on the db
  object for writes
- Tags are stored as JSON strings in SQLite — always `JSON.stringify` before write,
  `JSON.parse` after read

#### react-native-reanimated v4
- Animated style functions must be declared with `useAnimatedStyle` — not computed inline
- Shared values created with `useSharedValue` — never mutate `.value` outside worklet context
  on the UI thread without `runOnJS`
- Gesture handlers must be wrapped in `GestureDetector` — legacy `PanResponder` is not used

### Testing Rules

#### Test Organisation
- Test files live in `__tests__/` at the project root — not co-located with source files
- Naming: `<featureName>.test.ts` (e.g., `syncManagement.test.ts`)
- Run targeted tests with `yarn sync-test`; all tests with `yarn test`

#### Mock Patterns
- Mock the entire `src/infrastructure/storage` barrel when testing services that use SQLite:
  `jest.mock('../src/infrastructure/storage')`
- Mock `DatabaseInit.getInstance` as a `jest.Mock` and return a `getDatabase()` stub
- Mock the db object shape: `{ transaction: jest.fn(), executeSql: jest.fn() }`
- Always call `jest.clearAllMocks()` in `afterEach` — do not use `jest.resetAllMocks()`

#### Jest Transform Config
- `transformIgnorePatterns` must include react-native, @react-native, @react-navigation,
  react-redux, @reduxjs — these are ESM packages that need transformation
- If adding a new ESM dependency that fails in tests, add it to the `transformIgnorePatterns`
  allowlist in `jest.config.js`

#### What to Test
- Priority: sync queue operations, SQLite service interactions, business logic services
- Do NOT test Redux reducers in isolation — test via service layer integration
- UI component tests use `@testing-library/react-native` render + user-event pattern
- `@testing-library/jest-native/extend-expect` matchers are globally available (set in
  `setupFilesAfterEnv`) — use `toBeVisible()`, `toHaveTextContent()` etc. without importing

#### Coverage
- `collectCoverageFrom` targets `src/**/*.{ts,tsx}` excluding `.d.ts` and `__tests__`
- No enforced coverage threshold currently — focus on critical sync/offline paths

### Code Quality & Style Rules

#### File & Folder Naming
- Screen components: `PascalCase` + `Screen` suffix — e.g., `HomeScreen.tsx`
- Reusable components: `PascalCase` — e.g., `TaskCard.tsx`, `SwipeableSimpleTaskCard.tsx`
- Services: `camelCase` + `Service` suffix — e.g., `syncQueueService.ts`, `tasksService.ts`
- Hooks: `camelCase` + `use` prefix — e.g., `useTasks.ts`, `useTaskEditor.ts`
- Types: `PascalCase` + descriptive suffix — e.g., `TaskType.ts`, `AuthState.ts`
- Validators: `camelCase` + `Validator` suffix — e.g., `taskValidator.ts`
- Folders: `camelCase` — e.g., `screens/`, `services/`, `application/`
- SVG components: `PascalCase` + `Icon` or `Button` suffix — e.g., `BinIcon.tsx`

#### Component Structure
- One component per file — no multi-export component files
- Custom hooks extract ALL stateful logic out of screen components
- Screen files should be thin: render layout + call one custom hook
- Reusable components in `src/presentation/component/` — screen-specific logic stays in screens

#### ESLint
- Config: `@react-native/eslint-config` — do not override rules without good reason
- Run `yarn lint` before committing to catch issues early
- No unused imports — the linter will flag them

#### Code Comments
- No JSDoc comments on internal functions — TypeScript types are the documentation
- Inline comments only for non-obvious logic (e.g., SQLite quirks, sync queue edge cases)
- No commented-out code in commits

### Development Workflow Rules

#### Scripts — Always Use These
- `yarn server` must be running before testing auth or sync features in the app
- `yarn pod-start` (not `yarn pod-install`) for first-time iOS setup — it runs
  `bundle install` first which is required
- `yarn clean-android` before building APK to avoid stale Gradle cache issues
- `postinstall` runs `patch-package` automatically — never skip `yarn install`
  after pulling changes that touch `patches/`

#### Physical Device Development
- Edit `src/infrastructure/api/config/apiConfig.ts` to set LAN IP for Android physical device
- Add `usesCleartextTraffic=true` to `android/gradle.properties` for HTTP on physical device
- These changes should NOT be committed — keep them local or use env-based config

#### Mock Backend (json-server)
- `db.json` is the local data store — reset it to restore a clean state
- `server-middleware.js` adds custom behaviour to json-server — check it before adding
  new routes, as it may already handle auth logic
- `routes.json` defines route aliases — add new aliases here, not in the app's API config

#### Adding Native Dependencies
- After `yarn add <native-package>`, always run `yarn pod-install` for iOS
- If a native package needs a patch, use `patch-package`: make changes in `node_modules`,
  run `yarn patch-package <package-name>`, commit the patch file in `patches/`
- Test on both platforms after adding native deps — behaviour can differ

#### Building for Release
- Android release: `yarn build-apk-release` — ensure signing config is in
  `android/app/build.gradle` before running
- iOS archive: `yarn archive-ios` — output at `ios/build/TaskBell.xcarchive`
- Deep link scheme `taskbell://` must be registered in both `AndroidManifest.xml` and
  `ios/TaskBell/Info.plist` before release builds

### Critical Don't-Miss Rules

#### Anti-Patterns to Avoid
- **DO NOT** add new tasks directly to the server without going through the sync queue —
  always write to SQLite first, then let `syncProcessor.ts` handle server sync
- **DO NOT** store auth tokens in plain AsyncStorage — session is managed via
  `userSessionStorage.ts` (SQLite-backed) for security and consistency
- **DO NOT** call `DatabaseInit` constructor directly — always use `getInstance()` singleton
- **DO NOT** dispatch Redux actions from inside SQLite callbacks — use `Promise` wrappers
  and dispatch after resolution
- **DO NOT** use `index.js` barrel files as the entry for the app — `index.js` at root
  registers the app with Metro; `App.tsx` is the actual root component
- **DO NOT** modify `db.json` manually as a substitute for API calls during dev — use
  `yarn server` and the app's actual flows to keep data consistent

#### Offline-First Edge Cases
- Guest mode data is DELETED on logout — never assume guest data persists across sessions
- Sync queue operations must maintain FIFO order — never re-order or batch queue entries
  outside of `syncProcessor.ts`
- On sync failure, the queue stops processing entirely — the next item is NOT retried
  automatically; user must manually retry from SyncManagementScreen
- Optimistic updates must always have a corresponding rollback path — if adding a new
  operation type, implement both the optimistic update AND the rollback in the service

#### Notification Edge Cases
- Notifications are cancelled automatically on task complete/delete — any new task status
  that should cancel notifications must call `notificationService` explicitly
- Deep link `taskbell://` navigation requires the app's navigation stack to be fully mounted
  — handle the case where the app cold-starts from a notification tap
- Notification permission is requested once on first launch — do not re-request on every
  app open; check permission state first

#### Security
- Never log auth tokens, passwords, or sensitive user data — `console.*` is stripped in
  prod but logs are visible in dev; treat them as potentially exposed
- Validate all user inputs through `src/domain/validators/` before any service call
- Image uploads: validate file type and size client-side before calling `uploadImageRequest`
- The app uses HTTP in dev (json-server) — production backend MUST use HTTPS

#### Performance Gotchas
- `react-native-reanimated` worklets run on the UI thread — keep them pure and fast;
  no heavy computation, no Redux access, no async calls inside worklets
- `FlatList` / task lists: always provide stable `keyExtractor` using task `id` — do not
  use array index as key
- SQLite queries in `tasksSQLiteService.ts` run on a background thread — do not block
  the JS thread waiting for results; always use the callback/Promise pattern
- `diff-match-patch` is installed but inactive — do not accidentally import or invoke
  `conflictResolutionService.ts` in the sync flow; it is prepared infrastructure only

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented — especially layer boundaries and SQLite patterns
- When in doubt, prefer the more restrictive option
- Reference `docs/index.md` for full architecture and source tree context

**For Humans:**
- Keep this file lean and focused on agent needs — avoid obvious rules
- Update when technology stack changes (new native deps, RN version upgrades)
- Review when patterns change (new screen types, new service patterns)
- Remove rules that become obvious over time

_Last Updated: 2026-03-10_
