# Story 1.2: Guest-Only Launch Flow

Status: done

## Story

As a **user**,
I want **to open the app and land directly on the home screen without any login prompt**,
so that **I can start planning tasks immediately with zero friction**.

## Acceptance Criteria

**AC1 — Cold start, no session**
- Given a fresh install of TaskBell with no existing session
- When the user cold-starts the app
- Then the app navigates directly to the `TabNavigator` (HomeScreen) — `AuthStackNavigator` is never shown
- And no login, signup, or "continue as guest" prompt appears

**AC2 — Restart with existing data**
- Given the app is restarted after previous use
- When the app initialises
- Then the existing local task data is loaded and the home screen is shown — no re-authentication required

**AC3 — Auth screens gated**
- Given the codebase contains `LogInScreen` and `SignUpScreen`
- When the app is built for MVP 1
- Then both screens remain in the codebase but `AppNavigator` never routes to `AuthStackNavigator` — no navigation path leads to either screen in MVP 1
- And app startup initialises a guest session automatically via `loginAsGuest.ts` without any user action

## Tasks / Subtasks

- [x] **Task 1: Guest-only cold start in AppNavigator** (AC1, AC3)
  - [x] In `AppNavigator.tsx`, when `checkExistingSession()` returns no session (`!result.success` or `!result.data`), call `loginAsGuest()`
  - [x] On successful guest login: call `storeGuestSession(guestData)`, dispatch `setGuestInfo(guestData)`, set initial route to `'Main'`
  - [x] Ensure initial route is never set to `'Auth'` in MVP 1 — always `'Main'` (existing session → Main; no session → create guest then Main)
  - [x] On guest login failure: still route to `'Main'` (e.g. dispatch minimal guest or retry) so Auth screen is never shown

- [x] **Task 2: Keep Auth stack registered but unreachable** (AC3)
  - [x] Leave `AuthStackNavigator` and `Auth` screen registered in `AppNavigator` Stack for future use
  - [x] Verify no code path in MVP 1 sets `initialRouteName` or navigates to `'Auth'`
  - [x] Confirm `LogInScreen` and `SignUpScreen` are not removed — only unreachable via navigation

- [x] **Task 3: Verify existing-session path** (AC2)
  - [x] Confirm that when `checkExistingSession()` returns existing guest or user data, app continues to dispatch setGuestInfo/setUserInfo and set initial route to `'Main'` (no behaviour change from current)
  - [x] Ensure local task data loads on HomeScreen as before — no re-auth

- [x] **Task 4: Tests and regression** (AC1, AC2, AC3)
  - [x] Add unit or integration tests that assert: no session → guest created and route is Main; existing session → route is Main; Auth is never initial route
  - [x] Run full test suite; fix any regressions

## Dev Notes

### Architecture (from planning-artifacts/architecture.md)

- **Decision 3:** `AppNavigator.tsx` must always route to `'Main'` on cold start. Fallback to `'Auth'` is removed for MVP 1. `loginAsGuest()` is called automatically when no existing session is found.
- **Session check logic:** If `checkExistingSession()` returns data → restore session (guest or user), dispatch accordingly, set `initialRoute('Main')`. Else (no session) → `await loginAsGuest()`, dispatch `setGuestInfo`, optionally `storeGuestSession`, then `setInitialRoute('Main')`.
- **AuthStackNavigator:** Keep `Auth` stack registered; `LogInScreen` and `SignUpScreen` remain in codebase but unreachable because no navigation path points to `'Auth'` in MVP 1.

### Key files

- `src/presentation/navigation/AppNavigator.tsx` — session check, initial route, guest auto-init
- `src/application/services/auth/loginAsGuest.ts` — already exists
- `src/application/services/auth/storeGuestSession.ts` — persist guest session
- `src/application/store/action/auth/setGuestInfo.ts` — Redux action
- `src/application/services/auth/checkExistingSession.ts` — existing session check

### Warnings

- Do not delete `LogInScreen` or `SignUpScreen` — they stay for MVP 2.
- Do not remove the `Auth` screen from the Stack — only ensure no path navigates to it on startup or in MVP 1 flows.

## Dev Agent Record

### Implementation summary

- **AppNavigator.tsx:** Initial route state set to `'Main'` (never `'Auth'`). When `checkExistingSession()` returns no session, call `loginAsGuest()`, then `storeGuestSession()` and `dispatch(setGuestInfo())`; always `setInitialRoute('Main')`. On catch, still set `'Main'`. Auth stack left registered; no navigation path to `'Auth'` in MVP 1.
- **HomeScreen.tsx / SettingScreen.tsx:** MVP1_HIDE_AUTH_UI = true — "Create an Account" (ConvertGuestPrompt) and Logout button hidden on Home and Settings so no auth prompts in MVP 1.
- **Tests:** `__tests__/navigation/guestOnlyLaunch.test.ts` — 4 tests: initial state Main, no setInitialRoute('Auth'), loginAsGuest/storeGuestSession/setGuestInfo in no-session path, and loginAsGuest returns guest user with required fields. Full suite passes.

### File List

- `src/presentation/navigation/AppNavigator.tsx` (modified)
- `src/presentation/screens/HomeScreen.tsx` (modified — MVP1_HIDE_AUTH_UI, hide ConvertGuestPrompt)
- `src/presentation/screens/SettingScreen.tsx` (modified — MVP1_HIDE_AUTH_UI, hide ConvertGuestPrompt and Logout)
- `_bmad-output/implementation-artifacts/1-2-guest-only-launch-flow.md` (created, then updated)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `__tests__/navigation/guestOnlyLaunch.test.ts` (added)

## Change Log

- 2026-03-11: Story implemented; guest-only cold start, Auth gated; status → review.
- 2026-03-11: Home/Settings Create Account and Logout hidden for MVP 1; story marked done.
