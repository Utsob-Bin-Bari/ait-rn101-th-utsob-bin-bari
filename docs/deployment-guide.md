# Deployment Guide — TaskBell

> **Generated:** 2026-03-10

---

## Android APK Builds

### Debug APK

```bash
yarn build-apk-debug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK

```bash
yarn build-apk-release
# Output: android/app/build/outputs/apk/release/app-release.apk
```

> For release builds, ensure signing keys are configured in `android/app/build.gradle`.

---

## iOS Builds

### Debug Build

```bash
yarn build-ios-debug
# Runs: yarn clean-ios && react-native run-ios --configuration Debug
```

### Release Build

```bash
yarn build-ios-release
# Runs: yarn clean-ios && react-native run-ios --configuration Release
```

### Archive for App Store

```bash
yarn archive-ios
# Output: ios/build/TaskBell.xcarchive
# Uses: xcodebuild -workspace TaskBell.xcworkspace -scheme TaskBell -configuration Release archive
```

---

## Backend Configuration

### Development (Emulator/Simulator)

`src/infrastructure/api/config/apiConfig.ts`:

```typescript
// Android emulator
API_BASE_URL = 'http://10.0.2.2:3000'

// iOS simulator
API_BASE_URL = 'http://localhost:3000'
```

### Development (Physical Device — Local Network)

```typescript
API_BASE_URL = Platform.OS === 'android'
  ? 'http://192.168.1.XXX:3000'   // ← your machine's LAN IP
  : 'http://localhost:3000';
```

Also add to `android/gradle.properties`:
```properties
usesCleartextTraffic=true
```

### Production

```typescript
API_BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000'
  : 'https://your-backend.com/api';  // ← production HTTPS URL
```

**Backend requirements:**
- REST API compatible with json-server schema (`/users`, `/tasks`, `/login`)
- HTTPS recommended for production
- Supports multipart uploads for images

**Recommended hosting:**
- Heroku, Railway, Render, DigitalOcean, AWS, Fly.io

---

## Notification Deep Linking

The app registers the URL scheme `taskbell://` for deep linking via `@notifee/react-native`.

Tap a notification → app opens directly to the relevant task.

Ensure the scheme is registered in:
- `android/app/src/main/AndroidManifest.xml` (intent filter for `taskbell://`)
- `ios/TaskBell/Info.plist` (URL scheme registration)

---

## Demo Resources

Pre-built Android APK and screen recording available:

**[Download APK & View Demo](https://drive.google.com/drive/folders/1z-CAOCxqKbxn3hzCe5QZzAh5yMuhvH-B?usp=sharing)**
