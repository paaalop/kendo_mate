# Tasks: Owner Admin Features

**Input**: Design documents from `/specs/005-owner-admin-features/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/actions.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: [US1], [US2], etc.
- **Paths**: `kendo/` root relative

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory `kendo/app/(dashboard)/payments`
- [x] T002 Create directory `kendo/app/(dashboard)/settings`
- [x] T003 Create directory `kendo/components/payments`
- [x] T004 Create directory `kendo/components/settings`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create migration `kendo/supabase/migrations/20260202000000_owner_admin_schema.sql` (테이블, RLS, pg_cron 예약 설정 및 세션 삭제 시 멤버 연동 해제 로직 포함)
- [x] T006 Add `generate_monthly_payments` and `reorder_curriculum_item` RPC functions to migration
- [x] T007 Define TypeScript interfaces for `Payment`, `Session`, `CurriculumItem` in `kendo/lib/types/admin.ts`
- [x] T008 Regenerate Supabase types using `npx supabase gen types typescript --local > kendo/lib/types/database.types.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure Access Control (Role Isolation) (Priority: P1)

**Goal**: Ensure only owners can access admin features and APIs

**Independent Test**: Login as instructor/member and verify 'Payments' and 'Settings' are hidden and inaccessible.

### Implementation for User Story 1

- [x] T009 [US1] Create server-side role check utility `checkOwnerRole` in `kendo/lib/utils/auth.ts` (or similar)
- [x] T010 [US1] Implement "Payments" and "Settings" link conditional rendering in `kendo/components/dashboard/nav-links.tsx` (or layout)
- [x] T011 [US1] Create `kendo/app/(dashboard)/payments/page.tsx` with server-side role check (redirect if not owner)
- [x] T012 [US1] Create `kendo/app/(dashboard)/settings/page.tsx` with server-side role check (redirect if not owner)

**Checkpoint**: Security enforcement is active; non-owners cannot see or access new pages.

---

## Phase 4: User Story 2 - Payment Management (Priority: P1)

**Goal**: Track and manage member monthly fees

**Independent Test**: Verify payment list loads, filters work, and status toggles update the database.

### Implementation for User Story 2

- [x] T013 [P] [US2] Implement `getMonthlyPayments` server action in `kendo/app/(dashboard)/payments/actions.ts`
- [x] T014 [P] [US2] Implement `updatePaymentStatus` server action in `kendo/app/(dashboard)/payments/actions.ts`
- [x] T015 [P] [US2] Implement `initializeMonthlyPayments` server action in `kendo/app/(dashboard)/payments/actions.ts`
- [x] T016 [US2] Create `StatusBadge` component in `kendo/components/payments/status-badge.tsx` (큰 텍스트/고대비 적용)
- [x] T017 [US2] Create `PaymentList` component with filtering in `kendo/components/payments/payment-list.tsx` (최소 44px 터치 영역 확보)
- [x] T018-1 [US2] Create `MonthPicker` component for target month selection in `kendo/components/payments/month-picker.tsx`
- [x] T018 [US2] Integrate `PaymentList` and `MonthPicker` into `kendo/app/(dashboard)/payments/page.tsx`

**Checkpoint**: Owners can view and manage monthly payments.

---

## Phase 5: User Story 3 - Dojo Configuration (Priority: P2)

**Goal**: Update Dojo profile and manage training sessions

**Independent Test**: Change dojo name and verify update. Add/Edit session and verify list.

### Implementation for User Story 3

- [x] T019 [P] [US3] Implement `updateDojoProfile` server action in `kendo/app/(dashboard)/settings/actions.ts`
- [x] T020 [P] [US3] Implement `getSessionList` and `manageSession` server actions in `kendo/app/(dashboard)/settings/actions.ts`
- [x] T021 [US3] Create `DojoProfileForm` component in `kendo/components/settings/dojo-profile-form.tsx` (큰 입력창 및 버튼 적용)
- [x] T022 [US3] Create `SessionManager` component (list + add/edit modal) in `kendo/components/settings/session-manager.tsx` (고대비 및 큰 폰트 적용)
- [x] T023 [US3] Integrate components into `kendo/app/(dashboard)/settings/page.tsx` (use Tabs if needed)

**Checkpoint**: Owners can configure dojo details and sessions.

---

## Phase 6: User Story 4 - Curriculum Management (Priority: P2)

**Goal**: Define and organize training curriculum

**Independent Test**: Add item, reorder it, verify order persists.

### Implementation for User Story 4

- [x] T024 [P] [US4] Implement `getCurriculumList` server action in `kendo/app/(dashboard)/settings/actions.ts`
- [x] T025 [P] [US4] Implement `manageCurriculumItem` server action in `kendo/app/(dashboard)/settings/actions.ts`
- [x] T026 [P] [US4] Implement `reorderCurriculumItem` server action (calls RPC) in `kendo/app/(dashboard)/settings/actions.ts`
- [x] T027 [US4] Create `CurriculumItem` component (display + drag handle/buttons) in `kendo/components/settings/curriculum-item.tsx`
- [x] T028 [US4] Create `CurriculumList` component with reordering logic in `kendo/components/settings/curriculum-list.tsx`
- [x] T029 [US4] Integrate `CurriculumList` into `kendo/app/(dashboard)/settings/page.tsx`

**Checkpoint**: Curriculum management is fully functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T030 Ensure strict RLS enforcement across all new tables (verify policies)
- [x] T031 Add loading states (skeletons) for Payment and Settings pages
- [x] T032 Verify mobile responsiveness for Payment List and Settings forms
- [x] T033 [US2] Implement validation to prevent viewing/generating payments for future months
- [x] T034 [US2] Add optimistic updates and error recovery (Toast) for payment status toggles

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 & 2** (Setup/Foundation) must complete first.
- **Phase 3** (US1 - Security) blocks UI access to other features, so it should be done early, but Phases 4, 5, 6 actions/components can be built in parallel if testing via API/Storybook.
- **Phase 4, 5, 6** are largely independent of each other and can run in parallel.

### Parallel Opportunities

- Server actions (T013, T014, T015, T019, T020, T024, T025, T026) can be implemented in parallel with UI components.
- US2 (Payments), US3 (Settings), US4 (Curriculum) can be assigned to different developers.

## Implementation Strategy

1.  **Foundation**: Initialize DB schema and Types.
2.  **Security**: Lock down the routes and nav.
3.  **Feature Logic**: Implement server actions for all stories.
4.  **UI Construction**: Build components and pages.
5.  **Integration**: Connect UI to actions.
