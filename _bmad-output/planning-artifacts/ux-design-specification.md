---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-core-experience', 'step-04-emotional-response', 'step-05-inspiration', 'step-06-design-system', 'step-07-defining-experience', 'step-08-visual-foundation', 'step-09-design-directions', 'step-10-user-journeys', 'step-11-component-strategy', 'step-12-ux-patterns', 'step-13-responsive-accessibility', 'step-14-complete']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/project-context.md'
  - 'docs/component-inventory.md'
  - 'src/presentation/constants/colors.ts'
  - 'src/presentation/styles/commonStyles.tsx'
  - 'src/presentation/screens/LogInScreen.tsx'
  - 'src/presentation/screens/SignUpScreen.tsx'
  - 'src/presentation/screens/HomeScreen.tsx'
  - 'src/presentation/screens/CreateTaskScreen.tsx'
  - 'src/presentation/screens/AllTasksScreen.tsx'
  - 'src/presentation/component/TaskCard.tsx'
  - 'src/presentation/component/CustomButton.tsx'
  - 'src/presentation/component/CustomTextInput.tsx'
designConstraints:
  - 'Follow existing color and design pattern'
  - 'Reuse existing components wherever possible'
  - 'Keep it simple'
  - 'Keep it responsive for mobile'
  - 'Width on percentage, height wrapped in ScrollView to avoid overflow on smaller devices'
---

# UX Design Specification — TaskBell

**Author:** Utsob
**Date:** 2026-03-11

---

## 1. Design Philosophy

TaskBell's UX philosophy is **opt-in friction**. The app should feel calm and frictionless for everyday planning — but deliberately assertive when you've chosen accountability. The design language mirrors this: clean, spacious, approachable for the task list; full-screen, focused, and urgent for the alarm dismiss moment.

**Core principles for this UX spec:**

1. **Extend, don't reinvent** — every new screen reuses existing components, color tokens, and layout patterns from the established codebase.
2. **Percentage-width layouts** — all content containers use `width: '90%'` or `width: '100%'` with horizontal padding. Never fixed pixel widths.
3. **ScrollView by default** — every screen that contains form inputs or a variable-length list wraps content in `ScrollView` with `contentContainerStyle={{ flexGrow: 1 }}` to prevent cut-off on smaller devices (360dp).
4. **No new colors** — all new screens draw exclusively from `src/presentation/constants/colors.ts`.
5. **No new primitives** — prefer `CustomButton`, `CustomTextInput`, `Header`, `TaskCard` variants, `FilterButtons` over custom one-off components.

---

## 2. Design System Foundation

### 2.1 Color Palette (existing — no additions)

| Token | Hex | Usage |
|---|---|---|
| `colors.background` | `#F2F5FF` | All screen backgrounds |
| `colors.purple` | `#3A49F9` | Primary actions, headings, active states |
| `colors.pink` | `#9C2CF3` | Accent, gradient start, error text |
| `colors.blobBlue` | `#2E3A59` | Body text, subtitles |
| `colors.white` | `#FFFFFF` | Cards, input backgrounds |
| `colors.grey` | `#D9D9D9` | Disabled states, placeholders |
| `colors.lightGrey` | `#E5EAFC` | Section backgrounds, chip backgrounds |
| `colors.border` | `#BFC8E8` | Input borders, dividers |
| `colors.devider` | `#BFC8E8` | Divider lines (alias) |
| `colors.darkGrey` | `#808080` | Secondary labels |
| `colors.red` / `colors.error` | `#FF3B30` | Destructive actions, overdue indicators |
| `colors.success` | `#34C759` | Completed state, successful photo validate |
| `colors.warning` | `#FF9500` | Due-today indicator, battery warning |
| `colors.inputBackground` | `#FFFFFF` | Text input fill |

### 2.2 Gradient (existing — from CustomButton)

```
[colors.pink (#9C2CF3)] → [colors.purple (#3A49F9)]
direction: left to right (start: {x:0, y:0.5}, end: {x:1, y:0.5})
```

Used in: `CustomButton`, screen/card header bars. **Reuse this exact gradient — don't introduce new gradients.**

### 2.3 Typography Scale

| Role | fontSize | fontWeight | color |
|---|---|---|---|
| Page title (H1) | 32 | `'bold'` | `colors.purple` |
| Section heading (H2) | 20–22 | `'700'` | `colors.blobBlue` |
| Card title | 16–18 | `'600'` | `colors.blobBlue` |
| Body / label | 14–16 | `'500'` | `colors.blobBlue` |
| Caption / helper | 12 | `'400'` | `colors.darkGrey` |
| Error text | 12 | `'400'` | `colors.pink` |

### 2.4 Spacing & Layout Rules

| Rule | Value |
|---|---|
| Screen content container width | `'90%'` with `alignSelf: 'center'` |
| Horizontal padding (full-bleed areas) | `paddingHorizontal: 20` |
| Border radius — cards | `12` |
| Border radius — buttons | `10–12` |
| Border radius — chips/badges | `20` (pill) |
| Header top padding — Android | `paddingTop: 50` (from `spacing.headerMarginTop`) |
| Header top padding — iOS | `paddingTop: 50` |
| Section spacing | `marginBottom: 16–24` |

### 2.5 Existing Components to Reuse

| Component | Reuse in |
|---|---|
| `CustomButton` | CreateTaskScreen (Save/Delete), AlarmDismissScreen (Retry/Cancel), SettingScreen |
| `CustomTextInput` | CreateTaskScreen (Title, Description, Tags) |
| `Header` | All screens except AlarmDismissScreen (full-screen camera) |
| `WeekCalendar` | CreateTaskScreen (due date) |
| `FilterButtons` | AllTasksScreen (All/Pending/Completed), HomeScreen |
| `SearchBar` | AllTasksScreen |
| `SwipeableSimpleTaskCard` | HomeScreen task list |
| `SimpleTaskCard` | AllTasksScreen list |
| `TaskCard` | TaskDetail view (if added) |
| `TaskList` / `HorizontalTaskList` | HomeScreen sections |
| `GuestModeBadge` | HomeScreen (if needed) |

---

## 3. Screen Inventory & Specifications

### MVP 1 Screen Set

| Screen | Status | Epic | Key Changes |
|---|---|---|---|
| `HomeScreen` | Existing — update | Epic 1, 2 | Remove auth/sync UI; add overdue badge; simplify to guest-only |
| `AllTasksScreen` | Existing — update | Epic 2 | Add overdue colour indicator on task rows |
| `CreateTaskScreen` | Existing — update | Epic 2, 3 | Add alarm toggle + time picker + photo-dismiss toggle section |
| `AlarmDismissScreen` | **NEW** | Epic 3 | Camera viewfinder + instruction + status feedback |
| `SettingScreen` | Existing — simplify | Epic 1 | Remove logout/sync actions; keep clear data only |

> **Screens to remove from navigation (Epic 1, Story 1.2):**
> - `LogInScreen` — gate out of AppNavigator
> - `SignUpScreen` — gate out of AppNavigator
> - `SyncManagementScreen` — hide from TabNavigator (dormant in MVP 1)

---

## 4. Screen Specifications

---

### 4.1 HomeScreen (Update)

**Purpose:** The daily planning hub. User lands here cold-start. Shows overdue tasks, today's tasks, and a way to add new ones.

**Layout structure:**

```
<SafeAreaView bg=colors.background>
  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

    [Header row]
    ── App title "TaskBell" (left, colors.purple, bold, 24px)
    ── + FAB / Add Task button (right, gradient pill, "+" or "Add Task")

    [Overdue Banner] — conditional, only if overdue tasks exist
    ── bg: colors.error at 10% opacity (rgba(255,59,48,0.10))
    ── border-left: 4px solid colors.error
    ── Text: "⚠ {N} overdue task{s}" — colors.error, 14px, bold
    ── paddingHorizontal: 20, paddingVertical: 10, marginBottom: 16

    [Section: Today's Tasks]
    ── Section label: "Today" — H2
    ── FilterButtons (All / Pending / Completed) — reuse existing component
    ── TaskList using SwipeableSimpleTaskCard
       · Swipe right → complete (green reveal)
       · Swipe left → delete (red reveal)
    ── Empty state: centred text "No tasks yet — tap + to add one"
       · illustration: optional, or just text + icon

    [Spacer for FAB clearance]

  </ScrollView>
</SafeAreaView>
```

**Component reuse checklist:**
- ✅ `FilterButtons` — unchanged
- ✅ `SwipeableSimpleTaskCard` — unchanged; add overdue badge overlay (see 4.1.1)
- ✅ `TaskList` — unchanged
- ✅ `GuestModeBadge` — keep if guest logic still exposed; else hide
- ❌ `HorizontalTaskList` — remove dashboard-style horizontal scroll; replace with single vertical list (simpler)
- ❌ `SyncIndicator` — remove (dormant in MVP 1)
- ❌ Profile greeting with user name — remove (guest mode, no name)

**4.1.1 Overdue indicator on task cards:**

Do not create a new component. Add a small pill badge inside `SwipeableSimpleTaskCard` / `SimpleTaskCard`:

```
If task.dueDate < today AND task.status !== 'completed':
  Show pill: bg=colors.error, text="Overdue", fontSize=10, color=white, borderRadius=20, paddingHorizontal=6, paddingVertical=2
  Task title text color → colors.error
```

**Responsive rules:**
- Header row: `width: '100%'`, `paddingHorizontal: 20`, `flexDirection: 'row'`, `justifyContent: 'space-between'`
- Section content: no fixed width — rely on flex and horizontal padding
- ScrollView wraps everything to handle phones with small screens

---

### 4.2 AllTasksScreen (Update)

**Purpose:** Full paginated task list with search, filter, and date selector.

**Changes required (minimal):**
1. Add overdue indicator (same pill badge as 4.1.1) to `SimpleTaskCard` rows
2. Sort order: overdue tasks surface first, then by due date ascending
3. Remove or hide sync-related UI elements if present

**Layout (existing structure preserved):**

```
<SafeAreaView bg=colors.background>
  <Header title="All Tasks" showBackButton />

  [WeekCalendar] — reuse unchanged
  [SearchBar] — reuse unchanged, toggleable
  [FilterButtons: All / Pending / Completed] — reuse unchanged

  <ScrollView>
    <TaskList>
      <SimpleTaskCard ... overdueIndicator={isOverdue} />
    </TaskList>

    [Empty state if no tasks match filter]
    [Load more / pagination trigger]
  </ScrollView>

  [Add Task Button — bottom right FAB or full-width CustomButton]
</SafeAreaView>
```

**Responsive rules:**
- TaskList uses `FlatList` with `keyExtractor={task => task.id}` — already implemented
- ScrollView wraps list to avoid cut-off at bottom on small screens

---

### 4.3 CreateTaskScreen (Update — add Alarm section)

**Purpose:** Create or edit a task. MVP 1 adds alarm scheduling and photo-dismiss as optional per-task settings.

**Layout structure (extend existing):**

```
<SafeAreaView bg=colors.background>
  <KeyboardAvoidingView behavior=ios:'padding' android:'height'>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

      [Gradient Header Bar]  ← existing, keep unchanged
      ── title: "New Task" or "Edit Task"
      ── gradient: colors.pink → colors.purple
      ── back/close button (left)

      [Content: width='90%', alignSelf='center']

        [Section: Task Details] ← existing fields, unchanged
        ── CustomTextInput: Title (required)
        ── CustomTextInput: Description (optional, multiline)
        ── WeekCalendar: Due Date picker
        ── Status selector (Pending / In Progress / Completed chips)
        ── Priority selector (Low / Medium / High chips)
        ── Tags input (comma-separated)
        ── Image attachment row

        [Divider line: height 1, bg=colors.devider, marginVertical=20]

        [Section: Alarm Settings]  ← NEW section
        ── Section label: "Alarm" — 18px, fontWeight:'600', colors.blobBlue, marginBottom:12

        Row: Alarm Toggle
        ── Left: bell icon (SVG) + label "Set Alarm"
           · fontSize:16, color:colors.blobBlue
        ── Right: Switch component, trackColor={{ false: colors.grey, true: colors.purple }}
        ── thumbColor: colors.white

        [If alarm enabled — animated expand, max-height transition]
          Row: Alarm Time picker
          ── Label: "Alarm Time" — 14px, colors.darkGrey
          ── TouchableOpacity showing selected time string
             · style: bg=colors.lightGrey, borderRadius=10, paddingHorizontal=16, paddingVertical=12
             · text: "06:30 AM" — 16px, colors.blobBlue, fontWeight:'500'
             · DateTimePicker (modal) on press

          [Divider: subtle, marginVertical=12]

          Row: Photo-Dismiss Toggle
          ── Left: camera icon (📷 or SVG CameraIcon) + label "Photo to Dismiss"
             · fontSize:16, color:colors.blobBlue
          ── Right: Switch, same style as alarm toggle

          [If photo-dismiss enabled]
            Info block:
            ── bg=colors.lightGrey, borderRadius=10, padding=12, marginTop=8
            ── Text: "You'll need to take a photo to dismiss this alarm."
               · fontSize:13, color:colors.darkGrey, lineHeight:20
            ── Optional: small thumbnail of last reference photo (future)

        [Divider line: marginVertical=20]

        [Action Buttons]
        ── CustomButton: "Save Task" (primary gradient) — width='100%'
        ── CustomButton: "Delete Task" (outline, border=colors.error, text=colors.error) — only in edit mode
           · variant: transparent bg, borderColor=colors.error, color=colors.error
        ── spacing: marginBottom=10 between buttons

        [Bottom safe area padding: paddingBottom=40]

    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
```

**Toggle interaction detail:**
- Use React Native `Switch` (built-in) — no custom component needed
- Alarm time row: animate `maxHeight` 0→auto on toggle using `LayoutAnimation.easeInEaseOut()` (simple, no reanimated needed for this)
- Photo-dismiss row: same expand pattern, only visible when alarm is enabled

**Component reuse checklist:**
- ✅ `CustomTextInput` — title, description, tags
- ✅ `CustomButton` — Save, Delete
- ✅ `WeekCalendar` — due date
- ✅ Gradient header — existing pattern
- ✅ Status/Priority chips — existing pattern (styled TouchableOpacity pills)
- ⬜ `Switch` — RN built-in, no extra package
- ⬜ `DateTimePicker` — already used in existing CreateTaskScreen for time

**Responsive rules:**
- All content inside `width: '90%'`, `alignSelf: 'center'`
- `ScrollView` prevents overflow when keyboard appears or on smaller devices
- Toggle rows: `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`
- No fixed heights on expandable sections — use `maxHeight` animation or conditional rendering

---

### 4.4 AlarmDismissScreen (NEW)

**Purpose:** The moment of truth. Alarm has fired. If photo-dismiss is enabled, this screen is the only way out — the user must take a photo. Design should feel urgent and focused, not dismissible.

**Layout structure:**

```
<SafeAreaView style={{ flex: 1, backgroundColor: colors.black }}>

  [Top Bar — overlaid on camera view or dark bg]
  ── Task title (centred, white, 18px, bold, max 2 lines, numberOfLines=2)
  ── Alarm time (centred, white, 14px, opacity 0.8)
  ── padding: paddingTop=spacing.headerMarginTop, paddingHorizontal=20

  ─────────────────────────────────────────────

  Case A: Photo-dismiss enabled
  ─────────────────────────────────────────────

  [Camera Viewfinder area]
  ── flex: 1 (takes remaining vertical space)
  ── Camera component fills full width
  ── Viewfinder overlay: thin rounded border (white, opacity 0.4, borderRadius=16)
     · width: '88%', aspectRatio: 3/4, centred, borderWidth: 2
  ── This is NOT a preview of what to photograph — just the live camera feed

  [Bottom Sheet — bg=rgba(0,0,0,0.85), paddingHorizontal=20, paddingBottom=40]
  ── Instruction text: "Take a photo to dismiss this alarm"
     · fontSize:16, color:white, textAlign:'center', marginBottom:20
  ── [Photo capture status — dynamic]
     · Idle: large circular shutter button
       - bg=white, width=72, height=72, borderRadius=36, alignSelf='center'
       - inner dot: bg=colors.pink, width=56, height=56, borderRadius=28
     · Validating: ActivityIndicator (white) + "Checking photo..." text
     · Success: CheckIcon (green, large) + "Alarm dismissed!" text (colors.success)
     · Failed: "Photo not recognised — try again" (colors.error, 14px) + retry shutter

  Case B: Photo-dismiss NOT enabled (simple dismiss)
  ─────────────────────────────────────────────

  [Centred content — dark background, no camera]
  <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:colors.black }}>
    ── Bell icon / alarm animation (large, white/gold)
    ── Task title: white, 24px, bold, textAlign:'center', paddingHorizontal=20
    ── Due time: white, 16px, opacity 0.8
    ── CustomButton: "Dismiss Alarm"
       · style: bg=colors.purple, borderRadius=12, width='80%', marginTop=32
       · text: "Dismiss Alarm", white, 18px, bold

  ─────────────────────────────────────────────

  [No Header component — full-screen immersive]
  [No back button — intentional. User must dismiss via photo or button]
  [Status bar: hidden or dark content on black bg]

</SafeAreaView>
```

**Key UX decisions:**
- **No easy escape** — this is the accountability contract. No back button, no skip, no snooze in MVP 1.
- **Full-screen dark UI** — contrasts with the light `#F2F5FF` app to signal "this is alarm mode, not planning mode".
- **Shutter button** — circular with inner dot matches standard camera UI mental model. No text needed.
- **Validation feedback** — inline in the bottom sheet. Never navigate away mid-flow; just update the UI state.

**Component reuse:**
- ✅ `CustomButton` — Case B dismiss button (gradient variant), Case A retry (outline variant)
- ✅ `CheckIcon` SVG — success state
- ⬜ Camera: `react-native-image-picker` — already in project (`imageStorage.ts`)
- ⬜ ActivityIndicator — RN built-in

**Responsive rules:**
- `flex: 1` on SafeAreaView and camera area — fills screen on all device sizes
- Bottom sheet: fixed `paddingBottom: 40` to clear home indicator on iPhone
- Task title: `numberOfLines={2}`, `ellipsizeMode='tail'` — won't overflow on long titles
- Shutter button: fixed 72px diameter (not percentage) — intentional, touch target standard

---

### 4.5 SettingScreen (Simplify)

**Purpose:** Minimal settings for guest mode MVP. Remove auth and sync actions. Keep clear data only.

**Keep:**
- "Clear all data" action (with confirmation dialog)
- App version info

**Remove:**
- Logout button
- Recover data (sync-related)
- SyncManagementScreen navigation link

**Layout (simplified):**

```
<SafeAreaView bg=colors.background>
  <Header title="Settings" />

  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View style={{ width: '90%', alignSelf: 'center', paddingTop: 20 }}>

      [Section: Data]
      ── Section label: "Data" — 12px, darkGrey, uppercase, letterSpacing:1, marginBottom:8
      ── Setting row: "Clear All Data"
         · bg=white, borderRadius=12, padding=16
         · Left: BinIcon (red) + label "Clear All Data" (colors.error, 16px)
         · Right: chevron right (›)
         · onPress → confirmation Alert → clearData()

      [Section: About]
      ── Setting row: "Version"
         · bg=white, borderRadius=12, padding=16
         · Left: label "App Version"
         · Right: version string (from package.json) in darkGrey

      [Spacer]

    </View>
  </ScrollView>
</SafeAreaView>
```

**Component reuse:**
- ✅ `Header` — unchanged
- ✅ `BinIcon` SVG — for clear data row
- ✅ `CustomButton` — if confirmation needed inline
- ✅ Alert (RN built-in) — confirmation dialog

---

## 5. Navigation Architecture (MVP 1)

### Cold Start Flow

```
App Launch
  └─► AppNavigator (checks guest mode)
        └─► TabNavigator (direct, no auth check)
              ├─► HomeTab    → HomeScreen
              ├─► TasksTab   → AllTasksScreen
              └─► SettingsTab → SettingScreen
```

**Removed from flow:** `AuthStackNavigator` → `LogInScreen` → `SignUpScreen`

### Alarm Deep Link Flow

```
Notification tap (taskbell://alarm?taskId=xxx)
  └─► AppNavigator handles deep link
        └─► Navigate to AlarmDismissScreen (modal / full-screen stack)
              └─► Photo captured & validated
                    └─► Task marked complete → navigate back to HomeScreen
```

### Task Creation Flow

```
HomeScreen (+) or AllTasksScreen (Add Task)
  └─► CreateTaskScreen (create mode)
        ├─► Fill title, due date
        ├─► [Optional] Toggle alarm → select time
        ├─► [Optional] Toggle photo-dismiss
        └─► Save → back to previous screen
```

### Tab Structure (unchanged from existing)

| Tab | Icon | Screen |
|---|---|---|
| Home | `HomeIcon` | `HomeScreen` |
| Tasks | `TasksIcon` | `AllTasksScreen` |
| Settings | `SettingsIcon` | `SettingScreen` |

> `SyncManagementScreen` — not accessible from tab in MVP 1 (dormant).

---

## 6. Interaction Patterns

### 6.1 Alarm Toggle Expand (CreateTaskScreen)

```
[Alarm Toggle OFF]
  ┌─────────────────────────────────────────┐
  │  🔔 Set Alarm                    [○──] │
  └─────────────────────────────────────────┘

[Alarm Toggle ON — expanded section appears below]
  ┌─────────────────────────────────────────┐
  │  🔔 Set Alarm                    [──●] │
  ├─────────────────────────────────────────┤
  │  Alarm Time                   [06:30 AM]│
  │─────────────────────────────────────────│
  │  📷 Photo to Dismiss           [○──]   │
  └─────────────────────────────────────────┘
```

Animation: `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` — built-in RN, smooth but zero overhead.

### 6.2 Photo-Dismiss Expand (CreateTaskScreen)

```
[Photo-Dismiss ON — info block appears below toggle]
  ┌─────────────────────────────────────────┐
  │  📷 Photo to Dismiss           [──●]   │
  ├─────────────────────────────────────────┤
  │ ℹ You'll need to take a photo to        │
  │   dismiss this alarm.                   │
  └─────────────────────────────────────────┘
```

Background: `colors.lightGrey`, borderRadius: 10.

### 6.3 Swipe-to-Complete / Delete (HomeScreen)

Existing `SwipeableSimpleTaskCard` — no changes needed. Keep as-is.

### 6.4 Overdue Indicator Pattern

Applies to: `SwipeableSimpleTaskCard`, `SimpleTaskCard`

```
Normal task:
  ┌─────────────────────────────────────────┐
  │  Submit project report    [Due Mar 12]  │
  └─────────────────────────────────────────┘

Overdue task:
  ┌─────────────────────────────────────────┐
  │  Submit project report    [OVERDUE ●]   │
  │  (title in colors.error)                │
  └─────────────────────────────────────────┘
```

Overdue pill: `{ backgroundColor: colors.error, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 }`, text: `{ color: colors.white, fontSize: 10, fontWeight: '600' }`.

### 6.5 Empty State Pattern

Consistent across HomeScreen and AllTasksScreen:

```
<View style={{ flex:1, justifyContent:'center', alignItems:'center', paddingHorizontal:40 }}>
  ── [Optional: simple icon/emoji, ~40px]
  ── Primary text: "No tasks yet" — 18px, colors.blobBlue, bold, textAlign:'center'
  ── Secondary text: "Tap + to create your first task" — 14px, colors.darkGrey, textAlign:'center', marginTop:8
</View>
```

### 6.6 Battery Optimisation Prompt (Android — Story 4.1)

This is a **system dialog** (Android native) — no custom UI design needed. App calls the Android system intent; OS shows the dialog. Only design concern: timing (show on first alarm save).

### 6.7 Photo Validation States (AlarmDismissScreen)

```
State machine:
  idle ──[capture]──► validating ──[pass]──► success → navigate away
                              └──[fail]──► failed → idle (retry)
```

| State | UI |
|---|---|
| `idle` | Shutter button (white circle with pink dot) |
| `validating` | ActivityIndicator (white) + "Checking..." (white, 14px) |
| `success` | CheckIcon (colors.success, 40px) + "Alarm dismissed!" (colors.success, 16px) |
| `failed` | Error text (colors.error) + "Try again" shutter button |

---

## 7. Responsive Layout Rules

### 7.1 Width Strategy

| Element | Width | Reason |
|---|---|---|
| Screen content container | `width: '90%'`, `alignSelf: 'center'` | Consistent margins on all phone widths |
| Full-bleed rows (headers, cards) | `width: '100%'`, `paddingHorizontal: 20` | Edge-to-edge with padding |
| Buttons | `width: '100%'` (inside 90% container) | Full-width within container |
| Toggle rows | `width: '100%'`, `flexDirection: 'row'`, `justifyContent: 'space-between'` | Label left, control right |
| Modals / sheets | `width: '90%'` or `width: '100%'` with `borderTopRadius` | — |

**Never use:** `width: 300`, `width: 350` or any fixed pixel width for layout containers.

### 7.2 Height Strategy

| Pattern | Usage |
|---|---|
| `flex: 1` | Screen root, camera viewfinder |
| `ScrollView contentContainerStyle={{ flexGrow: 1 }}` | All form screens (CreateTask, Settings) |
| `contentContainerStyle={{ paddingBottom: 40 }}` | Lists and forms with bottom buttons |
| No `height` on text containers | Let text wrap naturally |
| Fixed height only for: icons (SVG), shutter button (72px) | Intentional touch targets |

### 7.3 Minimum Screen Support

Target: **360dp width** (smallest standard Android) to **430px width** (iPhone Pro Max).

Key rules:
- `fontSize` never smaller than 12px (readability at 360dp)
- Tap targets minimum 44×44dp (follow iOS HIG / Android Material)
- `numberOfLines` on task titles: `2` max before ellipsis
- Status badges / pills: `flexShrink: 1` or fixed max-width to prevent overflow

---

## 8. Screen-by-Screen Component Map

| Screen | Reused Components | New/Modified Elements |
|---|---|---|
| HomeScreen | `FilterButtons`, `SwipeableSimpleTaskCard`, `TaskList`, `Header` | Overdue banner (View), remove sync/profile elements |
| AllTasksScreen | `Header`, `WeekCalendar`, `SearchBar`, `FilterButtons`, `SimpleTaskCard`, `TaskList` | Overdue pill on `SimpleTaskCard` |
| CreateTaskScreen | `CustomTextInput`, `CustomButton`, `WeekCalendar`, `Header` | Alarm section (Switch + time row + photo-dismiss row) |
| AlarmDismissScreen | `CustomButton`, `CheckIcon` | Camera feed, shutter button, bottom sheet, state machine |
| SettingScreen | `Header`, `BinIcon`, `CustomButton` | Remove logout/sync rows |

---

## 9. Accessibility Notes

- All interactive elements: minimum 44×44dp touch area
- Text contrast: all foreground text on `colors.background` (#F2F5FF) meets WCAG AA
- Error states: always paired with text (not colour alone)
- Switch components: accessibilityLabel prop on all toggles
- Loading states: `accessibilityLiveRegion='polite'` on status text updates

---

## 10. Implementation Notes for Developers

1. **AlarmDismissScreen** is the only fully new screen file. All others are modifications to existing files.
2. **Overdue indicator** logic: add a helper `isOverdue(task: Task): boolean` in domain layer — `dueDate < today && status !== 'completed'`.
3. **Alarm section** in CreateTaskScreen: add to `useTaskEditor` hook — fields: `alarmEnabled: boolean`, `alarmTime: Date | null`, `photoDismissEnabled: boolean`.
4. **ScrollView wrapping** in CreateTaskScreen is already present — ensure the new alarm section is inside it, not appended after the ScrollView closes.
5. **SettingScreen cleanup**: remove `handleLogout`, `handleRecoverData`, and associated `useSettings` calls from the render; the hook can keep those functions dormant.
6. **Navigation guard**: in `AppNavigator`, remove `AuthStackNavigator` branch — always route to `TabNavigator`. The `loginAsGuest.ts` use case should be called on app init automatically.
