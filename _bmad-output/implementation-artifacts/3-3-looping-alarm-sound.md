# Story 3.3: Looping Alarm Sound

Status: done

## Story

As a **user**,
I want **the alarm to play a loud, looping sound when the dismiss screen opens**,
So that **the alarm is impossible to ignore until I actively dismiss it**.

## Acceptance Criteria

**AC1 — Sound starts on screen mount**
- Given the alarm fires and the user opens the AlarmDismissScreen (via notification tap or foreground event)
- When the screen mounts
- Then a looping alarm tone starts playing immediately via `alarmAudioService`
- And the sound loops continuously — it does not stop after one play

**AC2 — Sound stops on dismiss**
- Given the alarm sound is looping on the AlarmDismissScreen
- When the user successfully dismisses the alarm (via button or valid photo)
- Then the sound stops immediately before navigating away

**AC3 — Sound stops on snooze**
- Given the alarm sound is looping on the AlarmDismissScreen
- When the user taps Snooze (go back)
- Then the sound stops before navigating away
- And the alarm notification is NOT cancelled (still pending)

**AC4 — Foreground event triggers same sound behaviour**
- Given the app is in the foreground and the alarm time arrives
- When `onForegroundEvent` navigates to `AlarmDismissScreen`
- Then the looping sound starts on screen mount (same behaviour as notification tap)

**AC5 — Silent mode respected**
- Given the device is on silent/vibrate mode
- When the alarm fires
- Then the sound respects system volume — it does not bypass silent mode in MVP 1

## Tasks / Subtasks

- [x] **Task 1: Install react-native-sound** (AC1–AC5)
  - [x] Add `react-native-sound` dependency
  - [x] Create `android/app/src/main/res/raw/` directory
  - [x] Bundle `alarm.wav` for Android in `res/raw/`; iOS `alarm.wav` copied to `ios/TaskBell/`

- [x] **Task 2: alarmAudioService** (AC1–AC3)
  - [x] Create `src/application/services/audio/alarmAudioService.ts`
  - [x] `start()` — loads and plays alarm.wav in a loop
  - [x] `stop()` — stops and releases the sound resource
  - [x] Graceful fallback: logs warning if audio file not found, no crash

- [x] **Task 3: Update AlarmDismissScreen** (AC1–AC4)
  - [x] Call `alarmAudioService.start()` in `useEffect` on mount
  - [x] Call `alarmAudioService.stop()` in `handleDismiss` before navigating
  - [x] Call `alarmAudioService.stop()` in `handleSnooze` before navigating
  - [x] Clean up sound on component unmount (return from useEffect)

- [x] **Task 4: Tests** (AC1–AC3)
  - [x] `alarmAudioService` API shape tests
  - [x] AlarmDismissScreen sound lifecycle (start on mount, stop on dismiss/snooze)

## Dev Notes

- `react-native-sound` requires a native rebuild after installation.
- Android asset: `android/app/src/main/res/raw/alarm.wav` — file name must be lowercase, no spaces.
- iOS asset: `alarm.wav` must be added to the Xcode project (Copy Bundle Resources).
- `alarmAudioService` uses module-level singleton to prevent double-play on re-render.
- Sound is released on `stop()` to free memory; re-created on next `start()` call.

## Audio Asset Setup (Manual Step)

After `yarn add react-native-sound && cd ios && pod install && cd ..`:

1. **Android**: `alarm.wav` already placed in `android/app/src/main/res/raw/alarm.wav`
2. **iOS**: Drag `ios/TaskBell/alarm.wav` into Xcode → TaskBell target → "Copy Bundle Resources"
3. Rebuild the native app (`yarn android` / `yarn ios`)

## Dev Agent Record

- **alarmAudioService:** Singleton service wrapping `react-native-sound`. `start()` creates a Sound instance, sets to loop, plays. `stop()` stops and releases. Graceful no-op if file not available.
- **AlarmDismissScreen:** `useEffect` starts sound on mount and returns cleanup function. `handleDismiss` and `handleSnooze` both call `alarmAudioService.stop()` before navigation.
- **Tests:** `__tests__/story-3-3-looping-alarm-sound.test.ts` — tests cover service API shape and screen sound lifecycle.

## File List

- `src/application/services/audio/alarmAudioService.ts` (created)
- `src/presentation/screens/AlarmDismissScreen.tsx` (modified — sound lifecycle added)
- `android/app/src/main/res/raw/alarm.wav` (created — generated 880Hz alarm tone)
- `ios/TaskBell/alarm.wav` (created — same file copied for iOS bundle)
- `__tests__/story-3-3-looping-alarm-sound.test.ts` (created)
- `_bmad-output/implementation-artifacts/3-3-looping-alarm-sound.md` (created)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated)

## Change Log

- 2026-03-11: Story 3.3 created; status → in-progress.
- 2026-03-11: All tasks complete — alarmAudioService, AlarmDismissScreen sound lifecycle, 12 tests pass; status → review.
- 2026-03-12: Lint errors fixed (circular type inference in test file); doc corrected alarm.wav → was alarm.mp3; status → done.
