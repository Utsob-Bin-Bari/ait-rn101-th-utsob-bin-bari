# Astha IT – React Native Take-Home Assignment

## Project Brief

**App:** Offline-first Task Manager  
A small, production-like productivity app.

### Core Behaviour
- User can **Sign up / Log in** (mocked backend allowed)
- **Task list** with offline-first sync and full CRUD (Create, Read, Update, Delete)
- **Attach an image** to a task (camera / gallery)
- **Local notifications** for due tasks
- **Search, filters, and pagination** for large lists
- **Reusable component library** with at least one **animated** UI element  
  (e.g. task add/remove animation or swipe to complete)
- **Proper navigation** (Stack + Tabs or Drawer)
- **State management** and **API integration** (REST or GraphQL)
- **Error boundaries** and crash-safe flows
- **Unit tests** for critical components

You may implement this as an **Expo** or **bare React Native** app —  
pick whichever you’re most comfortable with and document why.

---

## Scope & Timebox

- **Total time:** 12–18 hours (expected 2–3 days of effort)
- You may take inspiration from the [Figma design](https://www.figma.com/design/ZCtIwAvr23foZf1jHU5UZL/Task-manager-Mobile-app-Ui--Community-?node-id=0-1&p=f&t=gMdx2xkQBVxxW5o9-0)
- **Submission window:** Within 48–72 hours after starting
- Focus on a **working, polished core experience** over extra features

---

## 🧩 User Stories & Acceptance Criteria

### 1. Authentication
**User Story:**  
As a user, I want to sign up and log in so I can access my tasks.

**Acceptance:**
- Signup and Login screens exist (mocked backend or JSON server allowed)
- Auth state persists across restarts
- Invalid credentials show helpful error messages
- README explains how to reset test accounts

---

### 2. Task List (Offline-first)
**User Story:**  
As a user, I want to create, edit, delete, and view tasks that persist and sync when online.

**Acceptance:**
- Tasks visible in a paginated list (infinite scroll or "load more")
- Offline create/edit/delete queues and syncs when network returns
- Online sync merges local/server changes
- Conflict resolution documented (e.g. last-write-wins or user prompt)

---

### 3. Image Attachments
**User Story:**  
As a user, I want to attach a photo to a task from camera or gallery.

**Acceptance:**
- Camera and gallery selection supported/simulated
- Images persisted locally and uploaded when online
- Handle large images (resize/compress before upload)

---

### 4. Search, Filters & Pagination
**User Story:**  
As a user, I want to search tasks and filter by status/tag with pagination.

**Acceptance:**
- Search filters client-side (optionally server-side)
- Filter by **status** (All / Active / Completed) and **tag**
- Pagination performant on large lists

---

### 5. Notifications
**User Story:**  
As a user, I want local notifications for due tasks.

**Acceptance:**
- Local notification scheduled for a task’s due time (simulation acceptable)
- Notification opens the app and navigates to the task
- README documents how to test notifications (emulator vs device)

---

### 6. Navigation & UX
**User Story:**  
As a user, I want smooth, predictable navigation.

**Acceptance:**
- Use Stack + Tab (or Drawer) navigation
- Deep navigation opens correct screen (e.g. from notification)
- UI is responsive and accessible (touch targets, readable fonts)

---

### 7. App Stability & Errors
**User Story:**  
As a user, I want the app to surface helpful errors and not crash.

**Acceptance:**
- Implement error boundaries (root + key screens)
- Global error handler logs and shows user-friendly messages
- App recovers gracefully from network/storage failures

---

### 8. Tests
**User Story:**  
As a developer, I want tests to validate behaviour.

**Acceptance:**
- Unit tests using **Jest + React Native Testing Library**
- Test at least:
  - One reusable UI component
  - One custom hook/service (e.g., offline sync queue)
- Provide test coverage summary in README

---

## Technical Requirements

- **Language:** TypeScript (strict mode preferred)
- **Offline storage:** SQLite   
  (justify your choice in README)
- **API:** REST (mock server allowed)
- **Notifications:** Local notification library  
  (`expo-notifications` or `react-native-push-notification`)
- **Animations:** At least one meaningful animation (Reanimated or Animated API)
- **Error Boundaries:** Use `react-error-boundary` or custom implementation
- **Testing:** Jest + React Native Testing Library (3–5 tests)
- **Build Instructions:** Include Android/iOS run and build steps  
  (If Expo, include APK/TestFlight optional steps)
- **Documentation:** README with setup, architecture, trade-offs, run/test commands
- **Linting:** ESLint + Prettier


---

## Deliverables Checklist

- [ ] Public GitHub repo link
- [ ] README including:
  - Setup & run instructions (dev + Android/iOS build)
  - Architecture decisions & folder structure
  - Sync strategy & conflict resolution
  - Known trade-offs or limitations
  - Test coverage summary & test run commands
  - Demo video link (optional but recommended)
  - APK/TestFlight link (optional)
- [ ] Short demo video (2–5 mins) showing main flows (optional)
- [ ] Tests included and runnable
- [ ] (Optional) CI results link

**End of Document**
