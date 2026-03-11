# Component Inventory — TaskBell

> **Generated:** 2026-03-10
> **Location:** `src/presentation/component/`

---

## UI Components (16)

### Layout & Navigation

| Component | File | Description |
|---|---|---|
| **Header** | `Header.tsx` | Custom screen header with title and optional back navigation |

### Input & Interaction

| Component | File | Description |
|---|---|---|
| **CustomTextInput** | `CustomTextInput.tsx` | Styled text input with validation state |
| **Button** | `Button.tsx` | Base button component |
| **CustomButton** | `CustomButton.tsx` | Branded button with custom styling |
| **SearchBar** | `SearchBar.tsx` | Task search input with clear action |
| **FilterButtons** | `FilterButtons.tsx` | Status filter toggle buttons (All / Pending / Completed) |
| **WeekCalendar** | `WeekCalendar.tsx` | Horizontal week-view date picker for due date selection |

### Task Display

| Component | File | Description |
|---|---|---|
| **TaskCard** | `TaskCard.tsx` | Full task card with all details (title, status, due date, tags, image) |
| **SimpleTaskCard** | `SimpleTaskCard.tsx` | Compact task card for list views |
| **SwipeableSimpleTaskCard** | `SwipeableSimpleTaskCard.tsx` | Swipe-to-complete (right) and swipe-to-delete (left) using react-native-reanimated + gesture-handler |
| **TaskItem** | `TaskItem.tsx` | Single task row item |
| **TaskList** | `TaskList.tsx` | FlatList wrapper for task arrays |
| **HorizontalTaskList** | `HorizontalTaskList.tsx` | Horizontal scrollable task list (dashboard use) |

### Status & Feedback

| Component | File | Description |
|---|---|---|
| **SyncIndicator** | `SyncIndicator.tsx` | Animated icon showing sync queue status |
| **GuestModeBadge** | `GuestModeBadge.tsx` | Visual indicator when user is in guest mode |
| **ConvertGuestPrompt** | `ConvertGuestPrompt.tsx` | Prompt encouraging guest users to create an account |

---

## SVG Icon Components (13)

Located in `src/presentation/component/svgs/`

| Icon | File | Usage |
|---|---|---|
| **BackButton** | `BackButton.tsx` | Navigation back arrow |
| **BinIcon** | `BinIcon.tsx` | Delete action |
| **CheckIcon** | `CheckIcon.tsx` | Completion / confirm action |
| **EyeIcon** | `EyeIcon.tsx` | Show password |
| **EyeOffIcon** | `EyeOffIcon.tsx` | Hide password |
| **HardDriveIcon** | `HardDriveIcon.tsx` | Storage / data recovery |
| **HomeIcon** | `HomeIcon.tsx` | Home tab icon |
| **ProfileIcon** | `ProfileIcon.tsx` | User profile |
| **SearchButton** | `SearchButton.tsx` | Search trigger icon |
| **SettingsIcon** | `SettingsIcon.tsx` | Settings tab icon |
| **SyncIcon** | `SyncIcon.tsx` | Sync status / trigger (animated in some contexts) |
| **TasksIcon** | `TasksIcon.tsx` | Tasks tab icon |

---

## Screens (7)

Located in `src/presentation/screens/`

| Screen | File | Description |
|---|---|---|
| **LogInScreen** | `LogInScreen.tsx` | Email + password login form |
| **SignUpScreen** | `SignUpScreen.tsx` | Name, email, password registration form |
| **HomeScreen** | `HomeScreen.tsx` | Dashboard — task overview stats, horizontal task list |
| **AllTasksScreen** | `AllTasksScreen.tsx` | Full task list with search bar, filter buttons, pagination |
| **CreateTaskScreen** | `CreateTaskScreen.tsx` | Create or edit task — title, description, due date, tags, image |
| **SettingScreen** | `SettingScreen.tsx` | App settings — clear data, recover data, logout |
| **SyncManagementScreen** | `SyncManagementScreen.tsx` | Sync queue viewer — pending/failed counts, retry, pull-to-refresh |

---

## Custom Hooks (6)

Located in `src/presentation/hooks/`

| Hook | File | Manages |
|---|---|---|
| **useLogin** | `useLogin.ts` | Login form state, validation, submission |
| **useSignup** | `useSignup.ts` | Sign-up form state, validation, submission |
| **useTasks** | `useTasks.ts` | Task list fetching, pagination, search, filter |
| **useTaskEditor** | `useTaskEditor.ts` | Task create/edit form state and submission |
| **useSettings** | `useSettings.ts` | Clear data, recover data, logout actions |
| **useSyncManagement** | `useSyncManagement.ts` | Sync queue stats, retry logic, pull-to-refresh |

---

## Design System

| Element | Location | Notes |
|---|---|---|
| **Colors** | `src/presentation/constants/colors.ts` | App color palette constants |
| **Common Styles** | `src/presentation/styles/commonStyles.tsx` | Shared StyleSheet objects |
| **Spacing** | `src/presentation/utils/spacing.ts` | Layout spacing scale |
| **Status Bar** | `src/presentation/utils/statusBarConfig.ts` | Platform-aware status bar config |

---

## Animation Patterns

### SwipeableSimpleTaskCard
- **Swipe right** → complete task (green background reveal)
- **Swipe left** → delete task (red background reveal)
- Uses `react-native-reanimated` `withSpring` for snap-back
- Uses `react-native-gesture-handler` for native touch response
- Dynamic opacity based on swipe distance

### SyncIndicator / SyncIcon
- Rotation animation during active sync
- Uses `useNativeDriver` for performance

### Loading States
- 360° rotation animations for async operations (clear data, recover data, sync)
