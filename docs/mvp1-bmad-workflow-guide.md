# TaskBell MVP 1 — BMAD Workflow Guide

**Version Target:** `0.1.0` (dev) → `1.0.0` (production release)
**Project:** TaskBell — "Instead of alarm, user creates a task"
**Last Updated:** 2026-03-11

---

## Overview

This document is your step-by-step guide for building TaskBell MVP 1 using the proper BMAD agent workflow. Follow the phases in order. Each phase lists the exact slash command to invoke, which agent handles it, and what output you'll get.

---

## BMAD Agent Roster for This Project

| Agent | Slash Command | Role | When to Use |
|---|---|---|---|
| **John (PM)** | `/bmad-agent-bmm-pm` | Product Manager | PRD, product brief, requirements |
| **Bob (SM)** | `/bmad-agent-bmm-sm` | Scrum Master | Epics, stories, sprint planning |
| **Amelia (Dev)** | `/bmad-agent-bmm-dev` | Developer | Story implementation, code |
| **Quinn (QA)** | `/bmad-agent-bmm-qa` | QA Engineer | Code review, E2E tests |
| **Architect** | `/bmad-agent-bmm-architect` | Solution Architect | Architecture decisions, folder restructure |
| **BMAD Master** | `/bmad-agent-bmad-master` | Orchestrator | When you need guidance on what to do next |

> **Tip:** If you're ever unsure what to do next, type `/bmad-help` in any session.

---

## Phase 0 — Brainstorming (IN PROGRESS)

**Command:** `/bmad-brainstorming`
**Status:** ✅ In progress (session `brainstorming-session-2026-03-11-002.md`)

**Goal:** Explore edge cases, risks, UX ideas, and implementation approaches for all 6 MVP features before locking scope.

**Output:** `_bmad-output/brainstorming/brainstorming-session-2026-03-11-002.md`

---

## Phase 1 — Product Requirements (PM Agent)

**Command:** `/bmad-agent-bmm-pm` → then select **"Create PRD"**

**Agent:** John (PM)

**What to bring into the session:**
- The completed brainstorming output
- The 6 features defined in this guide (see Feature Inventory below)
- MVP scope boundaries: no login, no signup, no logout, no profile — guest mode only

**Output:** `_bmad-output/prd-taskbell-mvp1.md`

**Key things the PRD must capture:**
- What is IN scope for MVP 1 (F1–F6)
- What is explicitly OUT of scope (auth, sync, server) — moved to `_future/`
- Success criteria for each feature
- Versioning: `0.1.0` dev, `1.0.0` production

> **After PRD:** Run `/bmad-bmm-validate-prd` to validate it before moving forward.

---

## Phase 2 — Architecture (Architect Agent)

**Command:** `/bmad-agent-bmm-architect` → then select **"Create Architecture"**

**Agent:** Architect

**What to bring into the session:**
- Approved PRD
- Current project structure (see `docs/source-tree-analysis.md`)
- The existing `_bmad-output/project-context.md`

**Output:** `_bmad-output/architecture-mvp1.md`

**Key decisions the architecture must address:**
- Folder restructure: where auth/sync code moves (e.g., `src/_future/` or `src/_deferred/`)
- Which screens, services, and hooks are kept vs. deferred
- How guest-only SQLite flow works without auth
- Notification + alarm service layer design
- Image capture + validation service placement (clean architecture layers)
- Android background notification strategy (Techno/aggressive battery devices)

> **Track removed/deferred code here:** The architecture doc must list every file moved out of scope.

---

## Phase 3 — UX Design (UX Designer Agent)

**Command:** `/bmad-agent-bmm-ux-designer` → then select **"Create UX Design"**

**Agent:** UX Designer

**What to bring into the session:**
- Approved PRD
- Architecture doc

**Output:** `_bmad-output/ux-design-mvp1.md`

**Focus areas:**
- Task creation/edit form: image (optional), due date (optional), alarm toggle (disabled unless due date set)
- Alarm toggle UX: clear visual relationship between due date and alarm toggle
- Three task notification states: no date (no notification), date only (push only), date + alarm (full alarm)
- Alarm trigger UX (sound playing + full-screen notification + photo validation prompt)
- Photo validation UX (camera opens from alarm, validates to dismiss)
- Icon and splash screen specifications (F1)
- Guest mode onboarding (no login barrier)

---

## Phase 4 — Epics & Stories (SM Agent)

**Command:** `/bmad-agent-bmm-sm` → then select **"Create Epics and Stories"**

**Agent:** Bob (SM)

**What to bring into the session:**
- Approved PRD
- Architecture doc
- UX Design doc

**Output:** `_bmad-output/epics-mvp1.md`

**Expected Epic Structure:**

| Epic | Features |
|---|---|
| **Epic 1: Foundation & Code Restructure** | F2 — Move auth/future code, guest mode, folder cleanup |
| **Epic 2: Task Core** | F3 — CRUD, favourites, SQLite (completion) |
| **Epic 3: Icon & Splash** | F1 — App icon, splash screen |
| **Epic 4: Alarm System** | F4 — Due date alarm, sound, push notification |
| **Epic 5: Image Validation** | F5 — Camera capture, photo validation to dismiss alarm |
| **Epic 6: Android Background Notifications** | F6 — Background notification, Techno device compatibility |

> **After Epics:** Run `/bmad-bmm-check-implementation-readiness` to verify everything is ready.

---

## Phase 5 — Sprint Planning (SM Agent)

**Command:** `/bmad-agent-bmm-sm` → then select **"Sprint Planning"**

**Agent:** Bob (SM)

**Output:** `_bmad-output/sprint-plan-mvp1.md`

**Sprint sequence recommendation:**
1. Epic 1 (Foundation) — must be first; unblocks everything
2. Epic 3 (Icon/Splash) — quick win, independent
3. Epic 2 (Task Core) — core data layer, unblocks alarm and image
4. Epic 4 (Alarm System) — depends on task core
5. Epic 5 (Image Validation) — depends on alarm system
6. Epic 6 (Android Background) — can run in parallel with Epic 4/5

---

## Phase 6 — Feature Development Loop (Per Story)

This is the core loop. Repeat for every story in the sprint plan.

### Step 1: Create Story File
**Command:** `/bmad-bmm-create-story` → specify story identifier
**Agent:** Bob (SM)
**Output:** `_bmad-output/stories/story-[epic]-[n].md`

### Step 2: Implement the Story
**Command:** `/bmad-agent-bmm-dev` → select **"Dev Story"** → point to story file
**Agent:** Amelia (Dev)

**Dev agent rules (enforced automatically):**
- Reads the full story file before writing any code
- Executes tasks in order — no skipping
- Marks tasks `[x]` only when code AND tests pass
- Runs full test suite after each task
- Documents all changed files in the story file

### Step 3: Code Review
**Command:** `/bmad-bmm-code-review`
**Agent:** Quinn (QA)

### Step 4: E2E Tests
**Command:** `/bmad-bmm-qa-generate-e2e-tests` → specify the feature
**Agent:** Quinn (QA)

### Step 5: Sprint Status Check
**Command:** `/bmad-bmm-sprint-status`
**Agent:** Bob (SM) — surface risks, confirm progress

---

## Phase 7 — MVP 1 Completion

1. Run full test suite: `yarn test`
2. Build release APK: `yarn build-apk-release`
3. Manually bump version to `1.0.0` in `package.json` and `android/app/build.gradle`
4. Run `/bmad-bmm-document-project` to update docs for production state
5. Tag git: `git tag v1.0.0`

---

## Feature Inventory (MVP 1 Scope)

### F1 — Icon & Splash Screen
- Proper app icon (Android + iOS)
- Splash screen matching TaskBell brand

### F2 — Auth Removal & Code Restructure
- Move `LoginScreen`, `SignUpScreen`, auth services, sync services → `src/_deferred/`
- Move `LogInScreen.tsx`, `SignUpScreen.tsx` → `src/_deferred/screens/`
- App starts directly in guest mode — no auth gate
- Remove auth navigation flow from `App.tsx`
- **Track all moved files in the architecture doc**

### F3 — Task CRUD + Favourites + SQLite
- Create, update, delete tasks
- Mark task as favourite
- SQLite persistence via existing `tasksSQLiteService`
- Task schema: `title`, `image` (optional), `due_date` (optional), `is_alarm` (boolean, default false), `favourite` (boolean)

**Field relationship rules:**
- `due_date` is required for any scheduled notification to fire
- `is_alarm` can only be true when `due_date` is also set (enforce in validator)
- `is_alarm = false` + `due_date` set → push notification only at due time
- No `due_date` → no scheduled notification, no alarm possible

### F4 — Alarm System (`is_alarm = true` + `due_date` set)
- At due time: plays sound (via `@notifee/react-native`) + fires full-screen push notification
- Alarm can only be dismissed via photo validation (F5)
- Task with `due_date` but `is_alarm = false` → fires push notification only (no sound, no photo requirement)
- No `due_date` → no notification fires at all

**UI:** Task creation/edit form shows an "Alarm" toggle switch. Toggle is disabled (greyed out) unless a due date is also set.

### F5 — Image Validation (Alarm Dismissal)
- Triggered only when alarm fires (`is_alarm = true`)
- Camera opens from the notification action or alarm screen
- User takes photo
- Photo validated (match check against task image OR presence check if no task image)
- On validation success → alarm dismissed, task marked complete
- Tasks without `is_alarm` never require photo validation

### F6 — Android Background Notifications
- Notifications fire when app is backgrounded or killed
- Special handling for Techno devices (aggressive battery management)
- Foreground service or alarm manager strategy to survive battery optimisation

---

## Out of Scope for MVP 1 (Deferred to MVP 2)

These features are moved to `src/_deferred/` — do NOT delete, just isolate:

- User login / sign up / sign out
- User profile screen
- Server sync (json-server, sync queue, `syncProcessor.ts`)
- Conflict resolution service
- Network-aware features (`@react-native-community/netinfo` flows)
- Auth token management

---

## Versioning Plan

| Phase | Version |
|---|---|
| MVP 1 development | `0.1.0` |
| MVP 1 production release | `1.0.0` *(bump manually)* |
| MVP 2 development start | `1.0.1` |
| MVP 2 production release | `2.0.0` *(bump manually)* |

---

## Key Files to Reference During Development

| File | Purpose |
|---|---|
| `_bmad-output/project-context.md` | AI agent rules — read before every coding session |
| `docs/architecture.md` | Current architecture overview |
| `docs/source-tree-analysis.md` | Full source tree |
| `docs/data-models.md` | Task data models |
| `docs/component-inventory.md` | Existing components |
| `_bmad-output/prd-taskbell-mvp1.md` | PRD (created in Phase 1) |
| `_bmad-output/architecture-mvp1.md` | Architecture decisions (created in Phase 2) |
| `_bmad-output/epics-mvp1.md` | Epics and stories (created in Phase 4) |
| `_bmad-output/sprint-plan-mvp1.md` | Sprint plan (created in Phase 5) |

---

## Quick Reference: What Command to Use When

| Situation | Command |
|---|---|
| Unsure what to do next | `/bmad-help` |
| Need to create/edit the PRD | `/bmad-agent-bmm-pm` |
| Need to plan architecture/restructure | `/bmad-agent-bmm-architect` |
| Need to create epics and stories | `/bmad-agent-bmm-sm` |
| Need to implement a story | `/bmad-agent-bmm-dev` |
| Need to review code | `/bmad-bmm-code-review` |
| Need to generate E2E tests | `/bmad-bmm-qa-generate-e2e-tests` |
| Need to check sprint status | `/bmad-bmm-sprint-status` |
| Something went wrong mid-sprint | `/bmad-bmm-correct-course` |
| Need a post-epic review | `/bmad-bmm-retrospective` |
| Need to update project docs | `/bmad-bmm-document-project` |
