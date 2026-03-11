# Source Tree Analysis — TaskBell

> **Scan Level:** Quick (pattern-based)
> **Repository Type:** Monolith
> **Generated:** 2026-03-10

---

## Project Root

```
ait-rn101-th-utsob-bin-bari/          # Project root
├── src/                               # All application source code (Clean Architecture)
├── __tests__/                         # Test files (Jest)
├── android/                           # Android native project (Gradle)
├── ios/                               # iOS native project (Xcode + CocoaPods)
├── patches/                           # patch-package fixes for native modules
├── App.tsx                            # React Native root component
├── index.js                           # Metro bundler entry point
├── app.json                           # App name and display name config
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── babel.config.js                    # Babel transpilation config
├── metro.config.js                    # Metro bundler config
├── jest.config.js                     # Jest test runner config
├── db.json                            # JSON Server mock database
├── routes.json                        # JSON Server route config
├── server-middleware.js               # JSON Server custom middleware
├── Gemfile / Gemfile.lock             # Ruby dependencies (CocoaPods)
└── yarn.lock                          # Yarn lockfile
```

---

## Source Code (`src/`) — Clean Architecture

```
src/
├── application/                       # Business Logic Layer
│   ├── services/                      # Domain services (orchestration)
│   │   ├── auth/                      # Authentication business logic
│   │   │   ├── convertGuestToUser.ts  # Guest-to-account migration
│   │   │   ├── loginAsGuest.ts        # Guest session creation
│   │   │   ├── login/                 # Login service
│   │   │   ├── logout/                # Logout + session cleanup
│   │   │   ├── signup/                # User registration service
│   │   │   ├── storeGuestSession.ts   # Persist guest session in SQLite
│   │   │   └── index.js
│   │   ├── notifications/             # Notification scheduling
│   │   │   ├── notificationService.ts # Schedule/cancel @notifee notifications
│   │   │   └── index.js
│   │   ├── settings/                  # Data management
│   │   │   ├── clearDataService.ts    # Wipe all local data
│   │   │   ├── recoverDataService.ts  # Restore data from server
│   │   │   └── index.js
│   │   └── tasks/                     # Task business logic
│   │       ├── conflictResolutionService.ts  # 3-way merge (prepared, inactive)
│   │       ├── imageService.ts        # Image upload + local storage
│   │       ├── paginationService.ts   # Pagination cursor logic
│   │       ├── searchFilterService.ts # Search and filter operations
│   │       ├── syncCleanupService.ts  # Remove completed queue entries
│   │       ├── syncDebugService.ts    # Sync queue debugging utilities
│   │       ├── syncProcessor.ts       # FIFO queue processor ← Core sync engine
│   │       ├── syncQueueService.ts    # Queue CRUD operations
│   │       ├── taskEditorService.ts   # Task create/edit orchestration
│   │       ├── tasksService.ts        # Task CRUD business logic
│   │       ├── tasksSQLiteService.ts  # SQLite persistence for tasks
│   │       └── index.js
│   └── store/                         # Redux state management
│       ├── action/                    # Redux action creators
│       │   ├── auth/                  # Auth actions
│       │   ├── tasks/                 # Task actions
│       │   └── store/                 # Store-level actions
│       ├── reducer/
│       │   ├── authReducer.ts         # Auth state reducer
│       │   ├── tasksReducer.ts        # Tasks state reducer
│       │   └── rootReducer.ts         # Combined root reducer
│       ├── initialState.ts            # Default Redux state values
│       └── store.ts                   # Redux store configuration ← Entry point
│
├── domain/                            # Domain Layer (pure, no dependencies)
│   ├── types/                         # TypeScript type definitions
│   │   ├── auth/
│   │   │   ├── GuestUser.ts           # Guest session type
│   │   │   ├── LoginType.ts           # Login payload type
│   │   │   ├── SignUpType.ts          # Sign-up payload type
│   │   │   └── index.js
│   │   ├── store/
│   │   │   ├── AuthState.ts           # Redux auth state shape
│   │   │   ├── TasksState.ts          # Redux tasks state shape
│   │   │   └── index.js
│   │   └── tasks/
│   │       ├── ImageTypes.ts          # Image attachment types
│   │       ├── SyncTypes.ts           # Sync queue entry types
│   │       ├── TaskType.ts            # Core Task entity type
│   │       └── index.js
│   └── validators/                    # Domain validation rules
│       ├── loginValidator.ts          # Email + password validation
│       ├── signupValidator.ts         # Registration field validation
│       ├── taskValidator.ts           # Task field validation
│       └── index.js
│
├── infrastructure/                    # Infrastructure Layer (I/O adapters)
│   ├── api/                           # REST API integration
│   │   ├── config/
│   │   │   └── apiConfig.ts           # Base URL + Axios instance config ← Edit for device
│   │   ├── endpoints/
│   │   │   ├── AuthEndpoints.ts       # Auth API endpoint paths
│   │   │   └── TaskEndpoints.ts       # Task API endpoint paths
│   │   ├── hooks/
│   │   │   └── useApi.ts              # Axios wrapper React hook
│   │   └── requests/
│   │       ├── auth/
│   │       │   ├── loginRequest.ts    # POST /login
│   │       │   ├── signUpRequest.ts   # POST /users
│   │       │   └── index.js
│   │       └── tasks/
│   │           ├── createTaskRequest.ts   # POST /tasks
│   │           ├── deleteTaskRequest.ts   # DELETE /tasks/:id
│   │           ├── fetchTasksRequest.ts   # GET /tasks
│   │           ├── updateTaskRequest.ts   # PUT /tasks/:id
│   │           ├── uploadImageRequest.ts  # POST /upload
│   │           └── index.js
│   ├── storage/                       # SQLite local database
│   │   ├── DatabaseInit.ts            # DB open + initialisation ← Run on app start
│   │   ├── DatabaseSchema.ts          # Table DDL definitions
│   │   ├── imageStorage.ts            # Local image file management
│   │   ├── userSessionStorage.ts      # Auth session persistence
│   │   └── index.js
│   └── utils/                         # Infrastructure utilities
│       ├── NetworkService.ts          # Online/offline state detection
│       ├── notificationPermission.ts  # @notifee permission request
│       └── index.js
│
├── presentation/                      # Presentation Layer (UI only)
│   ├── component/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── ConvertGuestPrompt.tsx     # Prompt to convert guest account
│   │   ├── CustomButton.tsx
│   │   ├── CustomTextInput.tsx
│   │   ├── FilterButtons.tsx          # Task status filter buttons
│   │   ├── GuestModeBadge.tsx         # Guest mode indicator
│   │   ├── Header.tsx
│   │   ├── HorizontalTaskList.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SimpleTaskCard.tsx
│   │   ├── SwipeableSimpleTaskCard.tsx # Swipe-to-complete/delete (reanimated)
│   │   ├── SyncIndicator.tsx          # Sync status indicator
│   │   ├── TaskCard.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskList.tsx
│   │   ├── WeekCalendar.tsx           # Calendar date picker
│   │   ├── svgs/                      # SVG icon components
│   │   │   ├── BackButton.tsx
│   │   │   ├── BinIcon.tsx
│   │   │   ├── CheckIcon.tsx
│   │   │   ├── EyeIcon.tsx / EyeOffIcon.tsx
│   │   │   ├── HardDriveIcon.tsx
│   │   │   ├── HomeIcon.tsx
│   │   │   ├── ProfileIcon.tsx
│   │   │   ├── SearchButton.tsx
│   │   │   ├── SettingsIcon.tsx
│   │   │   ├── SyncIcon.tsx
│   │   │   └── TasksIcon.tsx
│   │   └── index.js
│   ├── constants/
│   │   └── colors.ts                  # App color palette
│   ├── hooks/                         # Screen-level custom hooks
│   │   ├── useLogin.ts
│   │   ├── useSettings.ts
│   │   ├── useSignup.ts
│   │   ├── useSyncManagement.ts
│   │   ├── useTaskEditor.ts
│   │   └── useTasks.ts
│   ├── navigation/                    # React Navigation config
│   │   ├── AppNavigator.tsx           # Root navigator ← Session check + routing
│   │   ├── AuthStackNavigator.tsx     # Login / Sign Up stack
│   │   ├── HomeStackNavigator.tsx     # Home tab stack
│   │   ├── SettingsStackNavigator.tsx # Settings tab stack
│   │   ├── TabNavigator.tsx           # Bottom tab navigator (3 tabs)
│   │   └── TasksStackNavigator.tsx    # Tasks tab stack
│   ├── screens/                       # Screen components
│   │   ├── AllTasksScreen.tsx         # Tasks list with search + filter
│   │   ├── CreateTaskScreen.tsx       # Create / edit task form
│   │   ├── HomeScreen.tsx             # Dashboard with stats
│   │   ├── LogInScreen.tsx            # Login form
│   │   ├── SettingScreen.tsx          # App settings + data management
│   │   ├── SignUpScreen.tsx           # Registration form
│   │   └── SyncManagementScreen.tsx   # Sync queue viewer + controls
│   ├── styles/
│   │   └── commonStyles.tsx           # Shared style objects
│   └── utils/
│       ├── spacing.ts                 # Layout spacing constants
│       └── statusBarConfig.ts         # Status bar configuration
│
└── types/                             # Global TypeScript declarations
    ├── diff-match-patch.d.ts          # Types for diff-match-patch library
    └── react-native-sqlite-storage.d.ts  # Types for SQLite library
```

---

## Tests (`__tests__/`)

```
__tests__/
└── syncManagement.test.ts             # Unit tests for sync queue (9 tests, all passing)
```

---

## Android (`android/`)

```
android/
├── app/
│   └── src/main/res/
│       ├── drawable/                  # App icons (vector/raster)
│       ├── mipmap-mdpi/               # App icon (mdpi)
│       ├── mipmap-hdpi/               # App icon (hdpi)
│       ├── mipmap-xhdpi/              # App icon (xhdpi)
│       ├── mipmap-xxhdpi/             # App icon (xxhdpi)
│       └── mipmap-xxxhdpi/            # App icon (xxxhdpi)
├── build.gradle                       # Top-level Gradle config
├── gradle.properties                  # Gradle properties (add usesCleartextTraffic for physical device)
└── settings.gradle
```

---

## iOS (`ios/`)

```
ios/
├── TaskBell/
│   └── Images.xcassets/              # iOS asset catalogue (icons, splash)
├── TaskBell.xcodeproj/                # Xcode project file
├── TaskBell.xcworkspace/              # Xcode workspace (use this to open)
└── Podfile / Podfile.lock            # CocoaPods dependency spec
```

---

## Key Entry Points

| File | Role |
|---|---|
| [index.js](../index.js) | Metro bundler entry — registers `App` component |
| [App.tsx](../App.tsx) | Root React component — Redux Provider, Navigation container |
| `src/presentation/navigation/AppNavigator.tsx` | Session check → Auth or Main routing |
| `src/application/store/store.ts` | Redux store setup |
| `src/infrastructure/storage/DatabaseInit.ts` | SQLite initialisation |
| `src/infrastructure/api/config/apiConfig.ts` | API base URL (edit for physical device) |
