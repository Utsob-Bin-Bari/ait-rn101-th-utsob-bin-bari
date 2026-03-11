# Development Guide — TaskBell

> **Generated:** 2026-03-10

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | Required by `engines` in `package.json` |
| Yarn | Any | Package manager |
| React Native CLI | Latest | `@react-native-community/cli` 20.0.0 |
| Android Studio | Latest | For Android development |
| Xcode | Latest | For iOS development (macOS only) |
| CocoaPods | Latest | iOS dependency management |
| Ruby + Bundler | System | For `bundle exec pod install` |

---

## Initial Setup

### 1. Install Dependencies

```bash
yarn install
```

> `postinstall` automatically applies `patches/react-native-sqlite-storage+6.0.1.patch` via `patch-package`.

### 2. iOS Setup (macOS only)

```bash
yarn pod-start
# Runs: bundle install && bundle exec pod install
```

### 3. Android Setup

```bash
yarn clean-android
# Runs: cd android && ./gradlew clean
```

---

## Running the App

### Start Mock API Server (required for auth + sync)

```bash
yarn server
# Starts json-server on http://0.0.0.0:3000
# Data persisted in db.json
```

### Start Metro Bundler

```bash
yarn start
```

### Run on Android

```bash
yarn android
```

### Run on iOS

```bash
yarn ios
```

---

## Running on a Physical Device

### Option A — Guest Mode (No server needed)

1. Install app on device
2. Launch → tap **"Continue as Guest"**
3. All features work locally — no sync

### Option B — Local Network (Full sync)

1. Find your machine's local IP: `ifconfig | grep "inet "`
2. Edit `src/infrastructure/api/config/apiConfig.ts`:
   ```typescript
   export const API_BASE_URL = Platform.OS === 'android'
     ? 'http://192.168.1.XXX:3000'   // ← your IP
     : 'http://localhost:3000';
   ```
3. Add to `android/gradle.properties`:
   ```properties
   usesCleartextTraffic=true
   ```
4. Ensure device and machine are on the same Wi-Fi network
5. Run `yarn server` then rebuild: `yarn android`

---

## Testing

### Run Sync Management Tests

```bash
yarn sync-test
# Runs: jest __tests__/syncManagement.test.ts
```

### Run All Tests

```bash
yarn test
```

### Test Coverage

| Area | Test File | Tests |
|---|---|---|
| Sync queue lifecycle | `__tests__/syncManagement.test.ts` | 9 (all passing) |

**What is tested:**
- Sync queue add / complete / delete operations
- Settings and Sync Management screen data consistency
- Queue statistics (pending, failed, completed counts)
- Retry logic for failed operations
- Cleanup of completed entries

### Test Framework

- **Runner:** Jest ^29.6.3
- **Library:** @testing-library/react-native ^13.3.3
- **SQLite:** Mocked in tests
- **Config:** `jest.config.js`

---

## Code Quality

### Linting

```bash
yarn lint
# Runs: eslint .
# Config: @react-native/eslint-config
```

---

## Common Development Tasks

### Adding a New Screen

1. Create screen component in `src/presentation/screens/`
2. Add to appropriate stack navigator in `src/presentation/navigation/`
3. Add TypeScript route type to navigation type definitions
4. Create a custom hook in `src/presentation/hooks/` if needed

### Adding a New API Endpoint

1. Add endpoint path to `src/infrastructure/api/endpoints/`
2. Create request function in `src/infrastructure/api/requests/`
3. Create/update service in `src/application/services/`
4. Add Redux action/reducer if state change is needed

### Adding a New Redux Slice

1. Add types to `src/domain/types/store/`
2. Add initial state to `src/application/store/initialState.ts`
3. Create actions in `src/application/store/action/`
4. Create reducer in `src/application/store/reducer/`
5. Register in `rootReducer.ts`

### Working with SQLite

1. Define schema changes in `src/infrastructure/storage/DatabaseSchema.ts`
2. Handle migrations in `src/infrastructure/storage/DatabaseInit.ts`
3. Use `src/application/services/tasks/tasksSQLiteService.ts` pattern for queries

---

## Project Scripts Reference

| Script | Command | Description |
|---|---|---|
| `yarn start` | `react-native start` | Start Metro bundler |
| `yarn android` | `react-native run-android` | Run on Android device/emulator |
| `yarn ios` | `react-native run-ios` | Run on iOS simulator |
| `yarn server` | `json-server --watch db.json ...` | Start mock API on port 3000 |
| `yarn test` | `jest` | Run all tests |
| `yarn sync-test` | `jest __tests__/syncManagement.test.ts` | Run sync tests only |
| `yarn lint` | `eslint .` | Lint code |
| `yarn open` | `open ios/TaskBell.xcworkspace` | Open in Xcode |
| `yarn clean-android` | `cd android && ./gradlew clean` | Clean Android build |
| `yarn clean-ios` | Pod deintegrate + install | Clean iOS + reinstall pods |
| `yarn pod-start` | `bundle install && bundle exec pod install` | Full iOS dependency setup |
| `yarn pod-install` | `pod install` | Install CocoaPods only |
| `yarn build-apk-debug` | Gradle assembleDebug | Build debug APK |
| `yarn build-apk-release` | Gradle assembleRelease | Build release APK |
| `yarn build-ios-debug` | RN run-ios (Debug config) | Build iOS debug |
| `yarn build-ios-release` | RN run-ios (Release config) | Build iOS release |
| `yarn archive-ios` | `xcodebuild archive` | Archive for App Store distribution |
