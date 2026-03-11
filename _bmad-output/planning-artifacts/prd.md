---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys']
inputDocuments:
  - '_bmad-output/brainstorming/brainstorming-session-2026-03-11-001.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-03-11-002.md'
  - '_bmad-output/project-context.md'
  - 'docs/index.md'
workflowType: 'prd'
briefCount: 0
researchCount: 0
brainstormingCount: 2
projectDocsCount: 8
classification:
  projectType: mobile_app
  domain: general
  complexity: medium
  projectContext: brownfield
---

# Product Requirements Document - TaskBell

**Author:** Utsob
**Date:** 2026-03-11

## Executive Summary

TaskBell is a free mobile productivity app (iOS + Android) built around a single behavioral insight: people already know which tasks they'll procrastinate on. The app gives users a daily planning ritual — create tasks, assign due dates, and selectively arm procrastination-prone tasks with alarms. When the alarm fires, the task is dismissed only by taking a photo, making avoidance harder than action.

MVP 1 targets the app stores with the smallest viable expression of this philosophy: task creation, due-date reminders, optional alarm scheduling, and photo-to-dismiss enforcement. All features operate in guest mode — no account, no server dependency, no friction at first launch. Future releases will layer in automation, integrations, and social/accountability features.

**Target Users:** Anyone who plans their day but struggles to follow through — particularly people who know their own procrastination patterns and want a pre-commitment tool that respects their self-awareness.

### What Makes This Special

Most productivity apps make it frictionless to ignore yourself — a single tap dismisses an alarm, a swipe clears a reminder. TaskBell inverts this: opt-in friction is the feature. Users self-select which commitments deserve the photo-dismiss treatment, creating a pre-commitment contract with themselves the night before. The alarm isn't just a reminder — it's the proof of execution moment.

Differentiator stack:
- **Selective friction:** Alarms are opt-in per task, not mandatory — preserving agency while enabling accountability
- **Planning ritual as core loop:** The app is used *before* the day begins, not reactively during it
- **Passive due-date surfacing:** Opening the app to plan tomorrow shows what's already overdue — no separate "overdue" workflow needed
- **Photo-dismiss as philosophy:** Not a gimmick — it's the product's accountability contract made physical

## Project Classification

| Field | Value |
|-------|-------|
| **Project Type** | Mobile App — React Native (iOS + Android, bare workflow) |
| **Domain** | General consumer productivity |
| **Complexity** | Medium (F6 Android OEM background alarm compatibility carries high technical complexity) |
| **Project Context** | Brownfield — existing codebase being production-readied for first public release |

## Success Criteria

### User Success

A user opens the app, creates a task for tomorrow, optionally sets an alarm with photo-dismiss, and the alarm fires and is dismissible on the day. The full loop — plan → alarm → prove you did it — works end-to-end without the user needing a guide or hitting an error.

### Business Success

- App published and live on both **Apple App Store** and **Google Play Store**
- Zero crash-causing bugs on the 6 core MVP 1 flows at time of submission
- App passes both store review processes on first or second submission attempt

### Technical Success

- Alarm fires reliably on standard Android devices and at least one aggressive OEM (Techno)
- Photo-dismiss completes without crash on first attempt on both iOS and Android
- App cold-starts correctly from a notification tap (deep link `taskbell://`)
- No layout breaks on standard phone screen sizes (360dp–430px width range)
- All 6 MVP 1 features work in guest mode with zero server dependency

### Measurable Outcomes

| Outcome | Definition of Done |
|---------|-------------------|
| App store submission | Both iOS + Android submitted and approved |
| Core flow stability | Zero crashes on: task create, alarm set, photo-dismiss, task complete, task delete |
| Visual integrity | No overflow, clipped text, or broken layout on standard phone sizes |
| Background alarm | Alarm fires after app is backgrounded for 10+ minutes on test device |

## Product Scope

### MVP — Minimum Viable Product

- **F1** App icon + splash screen (brand identity)
- **F2** Guest mode only — auth code removed or isolated, no login required
- **F3** Task CRUD + favourites + SQLite persistence
- **F4** Alarm system — due date triggers sound + push notification
- **F5** Photo-to-dismiss alarm (configurable error tolerance)
- **F6** Android background notification reliability (OEM battery-killer compatibility)

### Growth Features (Post-MVP)

- User accounts + cloud sync
- Recurring tasks / schedules
- Task categories / tags
- Widgets (home screen task view)
- Notification customisation (sound, snooze options)
- Automation integrations (e.g., calendar sync)

### Vision (Future)

- Social accountability — share completion streaks with friends
- AI-assisted planning — suggest which tasks to arm with alarms based on past behaviour
- Cross-device sync + web companion
- Full automation engine (if-this-then-that style task triggers)

## User Journeys

### Journey 1: The Evening Planner (Primary — Success Path)

**Persona:** Rafi, 26, working professional. Productive in theory, inconsistent in practice. He knows exactly what he needs to do tomorrow — the problem is doing it.

**Opening Scene:** It's 10 PM. Rafi opens TaskBell to plan tomorrow. The home screen shows his task list — a couple of overdue items from yesterday stare back at him. That's a passive reminder without a separate screen.

**Rising Action:** He taps "+" and creates three tasks: *Morning run*, *Submit project report*, *Call mum*. For the morning run — he knows himself — he taps the alarm icon and sets 6:30 AM. He enables photo-dismiss: he'll have to take a photo of his running shoes. For the other two, he just sets due dates. No alarm needed — he won't dodge those.

**Climax:** 6:30 AM. His phone rings. TaskBell notification fires. He taps it, the app opens to the dismiss screen. Half-asleep, he grabs his running shoes and takes the photo. The app validates it. Task marked complete. He actually gets up.

**Resolution:** By end of day, 2 of 3 tasks done. He opens TaskBell to plan tomorrow and sees yesterday's "Call mum" still pending — it surfaces automatically. He arms it with an alarm this time.

*Capabilities revealed: task creation, due date assignment, alarm scheduling, photo-dismiss, notification tap → deep link, overdue task surfacing*

---

### Journey 2: First Launch (Primary — New User)

**Persona:** Dina, 19, student. Downloaded TaskBell from the Play Store after a friend mentioned it.

**Opening Scene:** She installs and opens the app. No login prompt, no onboarding slides — she lands directly on the home screen. Empty task list, a "+" button. Immediately understandable.

**Rising Action:** She taps "+", types *"Finish assignment"*, sets tomorrow's date as due date. She sees the alarm toggle — tries it, sets 9 AM. Notices the photo-dismiss option, turns it on. Decides to use her laptop as the target photo.

**Climax:** Next morning, 9 AM. Notification fires. She taps it — app opens, camera activates. She takes a photo of her laptop. Alarm dismissed. She sits down and starts the assignment.

**Resolution:** She used the core loop correctly on her first try with zero instruction. The UI was self-evident.

*Capabilities revealed: zero-friction first launch (guest mode, no auth), intuitive task creation UI, photo-dismiss discoverability*

---

### Journey 3: The Reliability Edge Case (Primary — OEM Failure Path)

**Persona:** Karim, 30, using a Techno Spark device. Battery optimisation is aggressive — apps get killed within minutes.

**Opening Scene:** Karim sets a 7 AM alarm with photo-dismiss for *"Take medication"*. He backgrounds TaskBell and goes to sleep.

**Rising Action:** 7 AM. Silence. His Techno device killed the background process at 3 AM. No notification fires. He misses the alarm entirely.

**Climax:** This is the F6 failure case. The app must survive aggressive battery killers. The requirement: use Notifee with foreground service / exact alarm API, request battery optimisation exemption on Android, handle OEM-specific wakelock patterns.

**Resolution (desired):** With F6 implemented — the app requests battery optimisation exclusion on first alarm creation. Karim's device shows a system prompt. He allows it. 7 AM: alarm fires. Medication taken.

*Capabilities revealed: Android battery optimisation exemption request, foreground service for alarm reliability, Notifee exact alarm API, OEM compatibility testing requirement*

---

### Journey Requirements Summary

| Journey | Capabilities Required |
|---------|----------------------|
| Evening Planner | Task CRUD, due dates, alarm scheduling, photo-dismiss, deep link from notification, overdue surfacing |
| First Launch | Guest mode (no auth), clean empty state, intuitive "+" creation flow, photo-dismiss discoverability |
| OEM Edge Case | Battery optimisation exemption prompt, foreground service alarm, Notifee exact alarm API, OEM wakelock handling |
