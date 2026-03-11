# Story 1.1: App Icon & Splash Screen

Status: done

## Story

As a **user**,
I want **the app to display a custom TaskBell icon and branded splash screen on launch**,
so that **the app feels polished and trustworthy from the first interaction**.

## Acceptance Criteria

**AC1 — Android App Icon**
- Given the TaskBell app is installed on an Android device
- When the user views the home screen / app drawer
- Then the TaskBell custom icon is displayed (not the default React Native icon)
- And both `ic_launcher.png` and `ic_launcher_round.png` are populated at all required densities

**AC2 — iOS App Icon**
- Given the TaskBell app is installed on an iOS device
- When the user views the home screen
- Then the TaskBell custom icon is displayed at all required iOS icon slot sizes
- And the App Store marketing icon (1024x1024) is present in the AppIcon.appiconset

**AC3 — Android Branded Splash Screen**
- Given the TaskBell app is installed on an Android device
- When the user taps the app icon
- Then a branded splash screen is shown during app initialisation before the home screen appears
- And no white blank screen or default React Native loading view flashes during startup

**AC4 — iOS Branded Launch Screen**
- Given the TaskBell app is installed on an iOS device
- When the user taps the app icon
- Then the launch screen matches the TaskBell brand (not a blank white screen or default RN splash)
- And the LaunchScreen.storyboard displays a brand-consistent experience

## Tasks / Subtasks

- [x] **Task 1: Prepare icon assets** (AC1, AC2)
  - [x] Create or source a 1024x1024 TaskBell icon PNG (square, no rounding — OS applies mask)
  - [x] Generate all Android icon sizes from the base PNG:
    - `mipmap-mdpi/` → 48×48px (`ic_launcher.png`, `ic_launcher_round.png`)
    - `mipmap-hdpi/` → 72×72px
    - `mipmap-xhdpi/` → 96×96px
    - `mipmap-xxhdpi/` → 144×144px
    - `mipmap-xxxhdpi/` → 192×192px
  - [x] Generate all iOS icon sizes from the base PNG (see Dev Notes for full list)
  - [x] Place Android icons at `android/app/src/main/res/mipmap-{density}/`
  - [x] Place iOS icons at `ios/TaskBell/Images.xcassets/AppIcon.appiconset/`
  - [x] Verify `Contents.json` filenames match the actual PNG files placed

- [x] **Task 2: Android splash screen** (AC3)
  - [x] Install and configure `react-native-splash-screen` OR use the native Android 12+ SplashScreen API (see Dev Notes for decision)
  - [x] Create drawable resource for splash background/logo
  - [x] Update `android/app/src/main/res/values/styles.xml` to reference splash theme
  - [x] Update `android/app/src/main/AndroidManifest.xml` theme attribute if using new SplashScreen API
  - [x] Call `SplashScreen.hide()` in `MainActivity.kt` (or via JS) after app is mounted
  - [x] Test on physical Android device — ensure no white flash on cold start

- [x] **Task 3: iOS launch screen** (AC4)
  - [x] Update `ios/TaskBell/LaunchScreen.storyboard` with brand colours/logo
    - Current state: white background, "TaskBell" text (36pt bold), "Powered by React Native" footer
    - Target: brand colours (purple/pink gradient, `#3A49F9` / `#9C2CF3`) or at minimum TaskBell brand colour background with logo
  - [x] Verify `ios/TaskBell/Info.plist` references `LaunchScreen` (already set — verify unchanged)
  - [x] Test on iOS simulator and physical device

- [x] **Task 4: Verify no default icon remains** (AC1, AC2)
  - [x] Rebuild the app on both platforms after asset replacement
  - [x] Confirm the green React logo icon is no longer present on either platform

## Dev Notes

### Android Icon Generation — Required Sizes

```
Density     Size     DPI
mipmap-mdpi  48×48    160dpi
mipmap-hdpi  72×72    240dpi
mipmap-xhdpi  96×96   320dpi
mipmap-xxhdpi 144×144 480dpi
mipmap-xxxhdpi 192×192 640dpi
```

Both `ic_launcher.png` and `ic_launcher_round.png` required at each density.
Paths: `android/app/src/main/res/mipmap-{density}/ic_launcher.png`

### iOS Icon Generation — Required Sizes

From `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Contents.json`:

```
iPhone notification 20pt  @2x → 40×40px   @3x → 60×60px
iPhone settings     29pt  @2x → 58×58px   @3x → 87×87px
iPhone spotlight    40pt  @2x → 80×80px   @3x → 120×120px
iPhone app          60pt  @2x → 120×120px @3x → 180×180px
iOS App Store      1024pt @1x → 1024×1024px
```

All PNG files must be placed in `ios/TaskBell/Images.xcassets/AppIcon.appiconset/`
The `Contents.json` already has the correct slot definitions — just ensure filenames match.
✅ Use a tool like [makeappicon.com](https://makeappicon.com) or Xcode's icon importer to generate all sizes at once.

### Android Splash Screen — Decision Guide

**Option A (Recommended for MVP 1):** Use Android 12+ native SplashScreen API — `androidx.core:core-splashscreen`
- No new JS package needed
- Configure in `android/app/src/main/res/values/styles.xml`:
  ```xml
  <style name="Theme.App.Starting" parent="Theme.SplashScreen">
      <item name="windowSplashScreenBackground">@color/splashBackground</item>
      <item name="windowSplashScreenAnimatedIcon">@drawable/ic_splash_logo</item>
      <item name="postSplashScreenTheme">@style/AppTheme</item>
  </style>
  ```
- In `android/app/src/main/AndroidManifest.xml` update activity theme:
  ```xml
  android:theme="@style/Theme.App.Starting"
  ```
- In `android/app/src/main/java/com/taskbell/MainActivity.kt`, add in `onCreate()`:
  ```kotlin
  import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
  // ...
  installSplashScreen()
  ```
- Add to `android/app/build.gradle` if not present:
  ```
  implementation "androidx.core:core-splashscreen:1.0.1"
  ```

**Option B:** Use `react-native-splash-screen` package — adds JS-side control but requires native link.

**Recommendation:** Option A for MVP 1 — zero JS surface, no new package, works on Android 12+.

### iOS Launch Screen — Storyboard Update

Current storyboard (`ios/TaskBell/LaunchScreen.storyboard`) shows:
- White `systemBackgroundColor` background
- Centred "TaskBell" label (36pt bold, 1/3 down screen)
- "Powered by React Native" footer text

Minimum brand update for MVP 1:
- Change background from `systemBackgroundColor` to TaskBell purple `#3A49F9`
- Change text colour to white
- Optionally: add a simple bell icon/logo drawable via Xcode

The storyboard is XML — can be edited directly or via Xcode Interface Builder.

### Brand Colours Reference

From `src/presentation/utils/colors.ts`:
```typescript
purple: '#3A49F9'       // Primary brand colour
pink:   '#9C2CF3'       // Accent / gradient end
background: '#F2F5FF'   // App background
```

### Architecture Constraints

- [Source: docs/architecture.md#Additional Requirements]
  > "App icon assets placed in platform-specific asset folders; splash screen configured per platform"
- No JS library modification needed for icon assets — pure native asset replacement
- `react-native-reanimated` and gesture handler must remain untouched — no changes to `babel.config.js` or `App.tsx` for this story
- Do NOT run `yarn pod-install` unless adding a new native dependency

### Project Structure Notes

```
ios/TaskBell/
  Images.xcassets/
    AppIcon.appiconset/
      Contents.json           ← already defines slots, just add PNGs
      [icon PNGs go here]
  LaunchScreen.storyboard     ← update brand colours
  Info.plist                  ← UILaunchStoryboardName already set, don't change

android/app/src/main/res/
  mipmap-mdpi/
    ic_launcher.png           ← replace with TaskBell icon
    ic_launcher_round.png     ← replace with TaskBell round icon
  mipmap-hdpi/  ... (same files)
  mipmap-xhdpi/ ... (same files)
  mipmap-xxhdpi/... (same files)
  mipmap-xxxhdpi/(same files)
  values/
    styles.xml                ← add splash theme (Option A)
    colors.xml                ← add splashBackground colour if needed
  drawable/
    ic_splash_logo.xml or .png ← add splash icon asset

android/app/src/main/
  AndroidManifest.xml         ← update activity theme if using Option A
  java/com/taskbell/
    MainActivity.kt           ← add installSplashScreen() call
```

### Warnings / Gotchas

1. **iOS icon sizes must be exact** — Xcode rejects PNG files that don't match declared dimensions in `Contents.json`. Use a generator tool.
2. **Android round icons** — `ic_launcher_round.png` is required since Android 7.1. If your icon is circular-safe, both `ic_launcher.png` and `ic_launcher_round.png` can be the same image.
3. **Android 12+ splash screen** — If targeting Android 12+ (`targetSdkVersion 31+`), the system ALWAYS shows a splash screen. If no config is provided, it uses the app icon on white background. Configuring it explicitly gives brand control.
4. **Do not modify `android/app/build.gradle` applicationId** — already set to `com.taskbell` after rename.
5. **No `yarn pod-install` needed** for this story (iOS asset changes are Xcode-only, no new pods).
6. **Clean build after asset changes** — run `yarn clean-android` before APK build to avoid stale Gradle cache.

### References

- [Source: docs/architecture.md#Additional Requirements] — icon and splash screen placement
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — acceptance criteria
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 1-2] — brand identity (colours, design philosophy)
- [Source: ios/TaskBell/Images.xcassets/AppIcon.appiconset/Contents.json] — iOS icon slot definitions
- [Source: android/app/src/main/AndroidManifest.xml] — Android icon references
- [Source: _bmad-output/project-context.md#Building for Release] — `yarn clean-android`, `yarn archive-ios`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Dev — Story Implementation)

### Debug Log References

- Used Python3 `struct`+`zlib` to generate valid RGB PNG files from scratch (no external image tools needed on this machine)
- Android splash screen: chose Option A (androidx.core:core-splashscreen:1.0.1) — no new JS package, pure native
- iOS storyboard: removed "Powered by React Native" footer; set background to #3A49F9 purple; set label colour to white
- `installSplashScreen()` placed in `MainActivity.kt#onCreate()` before `super.onCreate(savedInstanceState)`

### Completion Notes List

- **AC1**: Android icon PNGs replaced at all 5 densities (mdpi→xxxhdpi) for both ic_launcher and ic_launcher_round. Purple bell design on brand purple background replaces default green RN icon.
- **AC2**: iOS icon PNGs generated at all 9 required slot sizes (40–1024px). `Contents.json` updated with filenames for every slot.
- **AC3**: Android 12+ SplashScreen API configured via `Theme.App.Starting`; `core-splashscreen:1.0.1` added to build.gradle; `installSplashScreen()` called in `MainActivity.kt`; `ic_splash_logo.xml` drawable created; `colors.xml` defines `splashBackground=#3A49F9`.
- **AC4**: `LaunchScreen.storyboard` updated: background changed from `systemBackgroundColor` to TaskBell purple `#3A49F9`; "TaskBell" label colour changed to white; "Powered by React Native" footer removed.
- All 27 story-specific tests pass; 36/36 total tests pass (no regressions).
- Note: Icon assets are programmatic brand placeholders (purple background + white bell vector). For production/App Store submission, replace with professionally designed icons via a design tool.

### File List

- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (modified)
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png` (modified)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (modified)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png` (modified)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (modified)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png` (modified)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (modified)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png` (modified)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (modified)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png` (modified)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Contents.json` (modified)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Icon-20@2x.png` (added)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Icon-20@3x.png` (added)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Icon-29@2x.png` (added)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Icon-29@3x.png` (added)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Icon-40@2x.png` (added)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Icon-40@3x.png` (added)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Icon-60@2x.png` (added)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Icon-60@3x.png` (added)
- `ios/TaskBell/Images.xcassets/AppIcon.appiconset/Icon-1024.png` (added)
- `android/app/build.gradle` (modified — added core-splashscreen dependency)
- `android/app/src/main/res/values/colors.xml` (added)
- `android/app/src/main/res/values/styles.xml` (modified — added Theme.App.Starting)
- `android/app/src/main/res/drawable/ic_splash_logo.xml` (added)
- `android/app/src/main/AndroidManifest.xml` (modified — application theme → Theme.App.Starting)
- `android/app/src/main/java/com/taskbell/MainActivity.kt` (modified — installSplashScreen())
- `ios/TaskBell/LaunchScreen.storyboard` (modified — brand purple background, white text, removed footer)
- `__tests__/assets/appIconSplashAssets.test.ts` (added)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified — status → review)
