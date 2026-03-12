# Story 3.5: Photo Comparison & Dismiss Enforcement

Status: done

## Story

As a **user**,
I want **to dismiss the alarm only by taking a photo that matches my reference photo**,
So that **I'm forced to physically prove I am at the right place before the alarm stops**.

## Acceptance Criteria

**AC1 — "Take Photo to Dismiss" opens camera**
- Given a task has photo-dismiss enabled and the alarm has fired
- When the user arrives at the AlarmDismissScreen
- Then the "Take Photo to Dismiss" button opens the device camera
- And there is no direct dismiss button — snooze only

**AC2 — Passing photo dismisses the alarm**
- Given the user takes a photo on the dismiss screen
- When `photoComparisonService` returns a score ≥ `photo_dismiss_tolerance` (0.7)
- Then the alarm is dismissed: sound stops, notification cancelled, screen closes

**AC3 — Failing photo shows retry message**
- Given the comparison score < tolerance
- When the result is returned
- Then the user sees a "Photo doesn't match — try again" message
- And the looping sound continues; the camera can be opened again immediately

**AC4 — Fallback: no reference photo stored**
- Given the task has photo_dismiss_enabled = 1 but no photo_dismiss_ref_path
- When the alarm fires
- Then a warning "No reference photo set" is shown with a simple dismiss button

**AC5 — Fallback: photo-dismiss disabled**
- Given a task has photo_dismiss_enabled = 0 (or not set)
- When the alarm fires
- Then the AlarmDismissScreen shows a standard dismiss button — no camera required

## Tasks / Subtasks

- [x] **Task 1: photoComparisonService** (AC2–AC3)
  - [x] Create `src/application/services/photos/photoComparisonService.ts`
  - [x] `comparePhotos(base64A, base64B, tolerance)` — pure JS byte histogram, returns `{ score, passed }`
  - [x] Helper: `buildHistogram(base64)` — 64-bin byte-level histogram, normalised, skips JPEG header
  - [x] Helper: `histogramIntersection(h1, h2)` — returns 0.0–1.0 similarity

- [x] **Task 2: AlarmDismissScreen** (AC1–AC5)
  - [x] Add states: `comparing`, `compareError`
  - [x] `handleTakePhoto()`:
    - Opens camera via `imageService.pickImageFromCamera()`
    - Loads ref photo base64 from filesystem via `imageService.getImageFromLocal()`
    - Calls `photoComparisonService.comparePhotos()`
    - On pass: `alarmAudioService.stop()`, `cancelAlarmNotification()`, navigate back
    - On fail: sets `compareError` message
  - [x] UI mode A (photo_dismiss_enabled=1 + ref path): "Take Photo to Dismiss" flow
  - [x] UI mode B (photo_dismiss_enabled=1 + no ref path): warning badge + simple dismiss
  - [x] UI mode C (photo_dismiss_enabled=0): standard dismiss button
  - [x] Comparing spinner while camera/comparison is running
  - [x] Error badge shown on failure with retry option

- [x] **Task 3: Tests** (AC1–AC5)
  - [x] `photoComparisonService` — identical input scores 1.0
  - [x] Very different inputs score < tolerance
  - [x] Tolerance boundary (0.7) applied correctly
  - [x] AlarmDismissScreen mode selection logic
  - [x] Dismiss flow on pass; retry on fail

## Dev Notes

- Pure JS: `atob()` is a React Native global — used to decode base64 to byte array.
- Histogram is built over JPEG bytes (not decoded pixels). This is a proxy metric: same photo → high similarity; very different photo → low similarity. Sufficient for MVP.
- `photo_dismiss_tolerance` default = 0.7 (stored on task).
- No direct "Dismiss" button in mode A — only camera + snooze.
- Ref photo loading: `imageService.getImageFromLocal(path)` returns base64.

## File List

- `src/application/services/photos/photoComparisonService.ts` (created)
- `src/presentation/screens/AlarmDismissScreen.tsx` (modified — full photo-comparison flow)
- `__tests__/story-3-5-photo-comparison-dismiss.test.ts` (created)
- `_bmad-output/implementation-artifacts/3-5-photo-comparison-dismiss-enforcement.md` (created)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated)

## Change Log

- 2026-03-12: Story 3.5 created; status → in-progress.
- 2026-03-12: All tasks complete — photoComparisonService, AlarmDismissScreen rewrite (3 modes), 20 tests pass; status → review.
- 2026-03-12: Lint fix — added src/types/globals.d.ts for atob/btoa; status → done.
