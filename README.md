# AsthaIt - React Native Task Management App
A professional React Native application built with TypeScript for tasks management functionality with **offline-first capabilities**, SQLite database storage, json server, syncing and data recovery.

## Features

### Core Functionality
- **Complete CRUD Operations** - Create, read, update, and delete tasks
- **Offline-First Architecture** - Works seamlessly without internet connection
- **Image Attachments** - Attach photos from camera or gallery to tasks
- **Search & Filters** - Search tasks by title, filter by status
- **Pagination** - Efficient loading for large task lists
- **Auto-Sync** - Automatic synchronization when online
- **Task Categories** - Organize tasks with tags and status management

### User Experience
- **Guest Mode** - Explore the app instantly without authentication (local-only)
- **Authentication System** - Secure login/signup with persistent auth state
- **Responsive Design** - Optimized for all screen sizes with ScrollView
- **Pull-to-Refresh** - Manual refresh functionality on Sync Management
- **Smooth Animations** - Task add/remove animations with react-native-reanimated
- **Error Handling** - Comprehensive error boundaries and user-friendly messages
- **Touch-Optimized Interface** - Smooth interactions and gesture support

### Technical Excellence
- **SQLite Database** - Local storage with sync queue management
- **Redux State Management** - Centralized state with optimistic updates
- **Clean Architecture** - Layered design for maintainability
- **TypeScript** - Full type safety and IntelliSense support
- **Performance Optimized** - Efficient rendering and memory management
- **Unit Testing** - Jest + React Native Testing Library for critical components

## Architecture & Technology Choices

### Why React Native (Bare Workflow)?
- **New Architecture by Default** - Leverages the latest React Native architecture for improved performance and stability
- **Smaller Application Size** - Bare workflow produces optimized, lean production builds without Expo overhead
- **More Control Over Native Code** - Direct access to native modules and ability to customize native implementations as needed

### Why Layered Architectural Design Pattern?
- **Best for Offline-First Applications** - Clear separation between data persistence, business logic, and UI enables robust offline functionality
- **Separation of Concerns** - Each layer has specific responsibilities, making the codebase maintainable and testable
- **Optimistic Updates** - Architecture supports immediate UI updates while background sync operations are queued and processed

## Folder Structure

```
src/
├── application/          # Business Logic Layer
│   ├── services/        # Business logic services
│   │   ├── auth/        # Authentication services
│   │   ├── settings/    # Settings and data management
│   │   └── tasks/       # Task operations and sync
│   └── store/           # Redux store, actions, reducers
│
├── domain/              # Domain Layer
│   ├── types/           # TypeScript type definitions
│   │   ├── auth/        # Auth-related types
│   │   ├── store/       # Redux state types
│   │   └── tasks/       # Task-related types
│   └── validators/      # Domain validation rules
│
├── infrastructure/      # Infrastructure Layer
│   ├── api/             # API configuration and requests
│   │   ├── config/      # API configuration
│   │   ├── endpoints/   # API endpoints
│   │   ├── hooks/       # API hooks
│   │   └── requests/    # API request functions
│   ├── storage/         # SQLite database utilities
│   └── utils/           # Infrastructure utilities
│
└── presentation/        # Presentation Layer
    ├── component/       # Reusable UI components
    ├── constants/       # UI constants (colors, etc.)
    ├── hooks/           # Custom UI hooks
    ├── navigation/      # Navigation configuration
    ├── screens/         # Screen components
    ├── styles/          # Global styles
    └── utils/           # Presentation utilities
```

## Implementation Details

### Animated Reusable Components

The app uses react-native-reanimated for smooth, performant animations:

**SwipeableSimpleTaskCard Component:**
- **Swipe-to-Complete** - Swipe right to mark task as complete (green background)
- **Swipe-to-Delete** - Swipe left to delete task (red background)
- **Spring Animation** - Smooth spring-back animation using `withSpring`
- **Gesture Detection** - Built with react-native-gesture-handler for native touch response
- **Visual Feedback** - Dynamic opacity background based on swipe distance

**Other Animations:**
- **Rotation Animations** - Loading states with 360° rotation using `useNativeDriver`
- **Sync Icons** - Animated icons in Settings and Sync Management screens
- **Action Feedback** - Visual feedback for clear data, recover data, and sync operations

### Sync Strategy

Offline-first sync using FIFO (First-In-First-Out) queue processing:

- **Queue Operations** - All CRUD operations stored in SQLite `sync_queue` table
- **FIFO Processing** - Operations processed in order of creation (oldest first)
- **Network-Aware** - Automatically syncs when online with valid authentication
- **Stop-on-Failure** - Stops processing on first failure to preserve operation dependencies
- **Auto-Cleanup** - Completed operations are deleted from queue immediately
- **Retry Logic** - Failed operations can be manually retried with reset counter

### Optimistic Update Strategy

Instant UI updates with automatic rollback on failure:

1. **Immediate UI Update** - Redux state updated instantly for responsive UX
2. **Queue Operation** - Action added to sync queue for background processing
3. **Background Sync** - Operation synced to server when online
4. **Rollback on Failure** - UI reverted to previous state if operation fails
5. **Redux Synchronization** - State refreshed from SQLite on rollback

**Benefits:**
- Instant user feedback with no loading delays
- Works perfectly offline with automatic sync when online
- Consistent UI state through automatic rollback mechanism

### Navigation Structure

The app uses React Navigation v7 with a hybrid **Stack + Bottom Tabs** navigation pattern:

**Root Level: AppNavigator**
- Checks for existing user session on app start
- Routes to either Auth or Main based on authentication state
- Uses Stack Navigator for top-level routing

**Authentication Flow: AuthStackNavigator**
- **LogIn Screen** - User login with email/password
- **SignUp Screen** - New user registration

**Main App: TabNavigator (Bottom Tabs)**

Three main tabs with nested stack navigators:

1. **Home Tab** → HomeStackNavigator
   - **HomeMain** - Dashboard with task overview and statistics

2. **Tasks Tab** → TasksStackNavigator
   - **AllTasks** - Complete list of all tasks with search/filter
   - **CreateTask** - Form to create or edit tasks

3. **Settings Tab** → SettingsStackNavigator
   - **SettingsMain** - App settings, clear/recover data, logout
   - **SyncManagement** - Advanced sync queue management

**Navigation Features:**
- Session-based routing (Auth → Main on valid session)
- Persistent authentication state across app restarts
- Custom SVG icons for each tab (Home, Tasks, Settings)
- Custom header components with back navigation
- Headerless screens with custom UI components
- Type-safe navigation with TypeScript

**Navigation Flow:**
```
App Start → Check Session
    ↓
    ├─ No Session → Auth Stack (Login/SignUp)
    │                    ↓
    │               Login Success → Main
    │
    └─ Valid Session → Main (Bottom Tabs)
                         ↓
                    ├─ Home Tab
                    ├─ Tasks Tab
                    └─ Settings Tab
```

### Diff-Match-Patch: Ready But Not Used

**Why It's Not Currently Used:**

Tasks in this app are **not shared between users** due to json-server limitations. Since each user only edits their own tasks, there are no simultaneous edits from multiple users that would require conflict resolution. The current sync strategy uses **last-write-wins** (timestamp-based) which is sufficient for single-user task management.

**What's Already Prepared:**

The project includes full conflict resolution infrastructure ready for production use:

- **Package Installed** - `diff-match-patch` (v1.0.5) in dependencies
- **Type Definitions** - Complete TypeScript types in `src/types/diff-match-patch.d.ts`
- **Service Created** - `conflictResolutionService.ts` with 3-way merge implementation

**How It Would Be Used (If Tasks Were Shared):**

If the backend supported collaborative task editing, the service would integrate into the sync flow:


**Conflict Resolution Features:**
- **3-Way Text Merging** - Uses Google's diff-match-patch algorithm for intelligent merging
- **Tag Deduplication** - Combines and sorts unique tags from both versions
- **Strategy Options** - Supports both `last-write-wins` and `merge` strategies
- **Conflict Detection** - Identifies conflicts based on timestamps and field differences


This demonstrates production-ready architecture that can scale to multi-user collaborative features when backend support is added.

### Local Notifications & Deep Linking: Skipped Due to Time

**Why It Was Skipped:**

Due to project time constraints, local notifications for due tasks and deep linking navigation were not implemented. The core offline-first sync functionality, task management, and image handling took priority. However, the architecture supports easy integration of notification features.

**Implementation Strategy:**

**Task Scheduling:**
- Tasks would have `due_date` and `due_time` fields stored in SQLite
- When a task is created/updated with a due date, schedule a local notification
- Notification triggers at the exact due date/time even if app is closed

**Background Notification Handling:**
- Use `react-native-push-notification` for cross-platform local notifications
- Notifications persist in device's system notification tray
- Work independently of app state (foreground/background/closed)
- No internet required - purely local scheduling
- System handles notification delivery using native APIs

**Deep Linking Strategy:**
- Tapping notification opens app and navigates directly to specific task
- Use custom URL scheme: `asthait://task/:taskId`
- Notification payload includes `taskId` (server ID or local ID)
- App intercepts URL, extracts taskId, navigates to TaskEditor screen
- Handle both cold start (app closed) and warm start (app backgrounded)
- React Navigation's linking configuration maps URL to screen params

**Notification Lifecycle:**
- **Schedule** - When task created/updated with due_date
- **Update** - When due_date changes, cancel old and schedule new
- **Cancel** - When task deleted or marked complete
- **Store** - Track scheduled notifications in SQLite for cleanup

**Platform-Specific Handling:**
- **Android** - Notification channels for categorization
- **iOS** - Permission requests, badge count management
- **Both** - Handle timezone differences, respect Do Not Disturb settings

**Integration Points:**
- Notification service in application services layer
- Schedule calls in tasksService (create/update)
- Cancel calls in tasksService (delete/complete)
- Deep link handler in AppNavigator
- Permission requests on app first launch

**Benefits:**
- Timely reminders for due tasks
- Direct navigation from notification tap
- Works offline with local scheduling
- Seamless user experience across app states

**Estimated Implementation Time:** 4-6 hours with existing architecture

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v20 or higher)
- **Yarn** package manager
- **React Native CLI** installed globally
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **CocoaPods** (for iOS dependencies)

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. iOS Setup (macOS only)

```bash
yarn pod-start
```

### 3. Android Setup

```bash
yarn clean-android
```

### 4. Start JSON Server

Run the mock API server in a separate terminal:

```bash
yarn server
```

The server will start on `http://0.0.0.0:3000`

### 5. Run the App

```bash
yarn start
yarn android
yarn ios
```

## Running on a Physical Device

By default, the app is configured to work with the emulator/simulator. To test on a **physical device**, choose one of these options:

### Option 1: Guest Mode (Recommended for Quick Testing)

**Easiest way to test the app** - no server setup required:

1. Build and install the app on your device
2. Launch the app and tap **"Continue as Guest"**
3. All features work locally (create, edit, delete tasks)
4. No sync - data stays on device only

**Perfect for:**
- Quick UI/UX testing
- Feature demonstrations
- Offline functionality validation

**Note:** Guest data is deleted on logout.

---

### Option 2: Local Network Setup (Full Features)

For testing with **server sync** on a physical device:

*Already have an account? Skip to [Option 3](#option-3-production-backend-release)*

### Step-by-Step Setup:

**1. Find Your Computer's IP Address**

On macOS/Linux:
```bash
ifconfig | grep "inet "
# Look for your local IP (e.g., inet 192.168.1.100)
```

On Windows:
```bash
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Step 2: Update API Configuration**

Edit `src/infrastructure/api/config/apiConfig.ts`:

```typescript
export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://YOUR_COMPUTER_IP:3000'  // e.g., 'http://192.168.1.100:3000'
  : 'http://localhost:3000';
```

**3. Enable Cleartext Traffic (HTTP)**

Add to `android/gradle.properties`:
```properties
usesCleartextTraffic=true
```

**4. Ensure JSON Server is Accessible**

Make sure json-server is running on `0.0.0.0` (not just localhost):
```bash
yarn server
# Server runs on http://0.0.0.0:3000 (accessible from other devices)
```

**5. Rebuild and Run**

```bash
# Clean previous builds
yarn clean-android

# Run on connected device
yarn android

# Or build APK and install
yarn build-apk-debug
```

**Requirements:**
- Physical device and computer must be on the same WiFi network
- Firewall must allow connections on port 3000
- JSON server must be running while using the app

---

### Option 3: Production Backend (Release)

For production APK builds with **existing backend**:

**1. Deploy Backend**

Deploy your backend to a cloud service:
- Heroku, Railway, Render, DigitalOcean, AWS, etc.
- Use HTTPS for secure connections

**2. Update API Configuration**

Edit `src/infrastructure/api/config/apiConfig.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:3000'        // Emulator in development
    : 'http://localhost:3000'        // iOS simulator in development
  : 'https://your-backend.com/api'; // Production backend (HTTPS)
```

**3. Build Release APK**

```bash
yarn build-apk-release
```

**Benefits:**
- Works on any device with internet connection
- No local server needed
- Secure HTTPS connection
- Production-ready deployment

## SQLite Patch

This project uses `patch-package` to fix SQLite compatibility issues with React Native 0.82.1:

- Patch file: `patches/react-native-sqlite-storage+6.0.1.patch`
- Applied automatically via `postinstall` script
- Ensures SQLite works correctly on both iOS and Android

## Type Safety Additions

Added custom TypeScript declarations for libraries without official types:

### diff-match-patch (`src/types/diff-match-patch.d.ts`)
- Complete type definitions for Google's diff-match-patch library
- Prepared for future collaborative task editing features

### react-native-sqlite-storage (`src/types/react-native-sqlite-storage.d.ts`)
- Type-safe database operations
- Proper interfaces for Transaction, ResultSet, and SQLiteDatabase
- Ensures type safety for all database queries

## Testing

### Run Tests

```bash
yarn sync-test
```

### What We Test

The project includes comprehensive unit tests for the **Sync Queue Management System**, which is the core of the offline-first functionality:

**Test Coverage:**
- Sync Queue Lifecycle - Adding, completing, and deleting operations
- Status Consistency - Ensuring Settings and Sync Management screens show same data
- Operation Deletion - Completed operations are deleted, not marked as completed
- Queue Statistics - Accurate counting of pending, failed, and completed operations
- Retry Logic - Failed operations can be reset and retried
- Cleanup Operations - Removing completed entries from queue

**Test Results:**
- **Total Tests:** 9 test cases (all passing)
- **Coverage Focus:** Sync queue operations, status tracking, and data consistency
- **Test File:** `__tests__/syncManagement.test.ts`
- **Framework:** Jest with mocked SQLite database

### Why Test Syncing?

The sync queue is critical for offline-first functionality:
- Ensures operations are properly queued when offline
- Validates that completed operations don't clutter the database
- Confirms status consistency across different screens
- Verifies retry mechanisms for failed operations

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn start` | Start Metro bundler |
| `yarn android` | Run on Android device/emulator |
| `yarn ios` | Run on iOS simulator |
| `yarn server` | Start JSON Server on port 3000 |
| `yarn open` | Open iOS project in Xcode |
| `yarn lint` | Run ESLint for code quality |
| `yarn test` | Run all Jest tests |
| `yarn sync-test` | Run sync management tests only |
| `yarn clean-android` | Clean Android build |
| `yarn clean-ios` | Clean iOS build and reinstall pods |
| `yarn pod-start` | Install Ruby dependencies and pods |
| `yarn pod-install` | Install CocoaPods dependencies |
| `yarn build-apk-debug` | Build Android APK (debug) |
| `yarn build-apk-release` | Build Android APK (release) |
| `yarn build-ios-debug` | Build iOS app (debug) |
| `yarn build-ios-release` | Build iOS app (release) |
| `yarn archive-ios` | Archive iOS app for distribution |

## Build Instructions

### Android APK

**Debug Build:**
```bash
yarn build-apk-debug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release Build:**
```bash
yarn build-apk-release
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### iOS Build

**Debug Build:**
```bash
yarn build-ios-debug
```

**Release Build:**
```bash
yarn build-ios-release
```

**Archive for Distribution:**
```bash
yarn archive-ios
```
Output: `ios/build/AsthaIt.xcarchive`

## Demo & Downloads

### Pre-built APK and Screen Recording

Download the pre-built Android APK and watch the app demo:

**[Download APK & View Demo](https://drive.google.com/drive/folders/1z-CAOCxqKbxn3hzCe5QZzAh5yMuhvH-B?usp=sharing)**

This folder contains:
- Android APK (ready to install on any Android device)
- Screen recording demonstrating the app's features

