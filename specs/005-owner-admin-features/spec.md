# Feature Specification: Owner Admin Features

**Feature Branch**: `005-owner-admin-features`  
**Created**: 2026-02-01  
**Status**: Draft  
**Input**: User description: "@docs/PRD.md 의 "3. 핵심 기능 상세 명세 - A. 역할별 권한 매트릭스" 및 "[관리자 앱] 탭 4: 설정" 중 관장 전용 기능을 바탕으로 명세서를 작성해 주세요. **상세 요구사항:** 1. **권한 격리:** `payments` 테이블 조회 및 도장 정보 수정 API는 반드시 `role='owner'` 체크를 통과해야 함을 명시하세요. 사범 계정에서는 해당 UI 메뉴 자체가 숨김(Hidden) 처리되어야 합니다. 2. **회비 관리 (Payments):** * 월별 수납 현황 리스트 (대상자 전체 조회). * 상태 필터: 미납(Unpaid) / 확인요청(Pending) / 납부완료(Paid). * 액션: 관장님이 수동으로 '납부완료' 처리하는 기능. 3. **도장 정보 수정:** 도장 이름, 수련 시간표(세션) 설정 기능. 4. **커리큘럼 관리:** `curriculum_items` 추가/수정/순서 변경 기능."

## Clarifications

### Session 2026-02-01
- Q: How should the system handle the initialization of monthly payment records for members? → A: **Auto-generate**: Automatically create `Unpaid` records for all `active` members at the start of each month.
- Q: How should the training schedule data be structured? → A: **Fixed Slots**: Owner defines named/timed sessions (e.g., "5시부", 17:00-18:00) which members are assigned to.
- Q: Should the owner have the ability to revert a `Paid` status? → A: **Full Toggle**: Owner can freely change status between `Unpaid`, `Pending`, and `Paid` at any time.
- Q: For reordering curriculum items, how strictly should the `order_index` be managed? → A: **Automatic Sequential**: System updates all affected items' `order_index` to maintain a strict 1..N sequence.
- Q: When updating Dojo information, should changes be applied immediately? → A: **Immediate Global**: Updates to `dojos` table affect all members and UI instantly.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Access Control (Role Isolation) (Priority: P1)

As an owner, I want exclusive access to sensitive administrative features (payments, dojo settings) so that unauthorized users cannot view or modify financial and structural data.

**Why this priority**: Security is paramount. exposing payment data or allowing unauthorized changes to the dojo structure is a critical failure.

**Independent Test**: Can be tested by logging in as a non-owner and verifying inability to access payment/settings pages and API endpoints.

**Acceptance Scenarios**:

1. **Given** a logged-in user with `role='instructor'` or `role='member'`, **When** they view the main navigation, **Then** the "Payments" and "Settings" tabs are NOT visible.
2. **Given** a logged-in user with `role='instructor'`, **When** they attempt to directly access the payment API endpoint (e.g., via curl), **Then** the system returns a 403 Forbidden error.
3. **Given** a logged-in user with `role='owner'`, **When** they view the dashboard, **Then** they can see and access "Payments" and "Settings".

---

### User Story 2 - Payment Management (Priority: P1)

As an owner, I want to track and manage member payments for each month so that I can maintain financial health and identify unpaid members.

**Why this priority**: Core business function for the dojo owner.

**Independent Test**: Can be tested by creating dummy payment records and verifying the list view, filtering, and status update functionality.

**Acceptance Scenarios**:

1. **Given** the owner is on the Payments page, **When** the page loads, **Then** a list of all members and their payment status for the current month is displayed.
2. **Given** the payment list is displayed, **When** the owner selects the "Unpaid" filter, **Then** only members with 'Unpaid' status are shown.
3. **Given** a member with "Pending" or "Unpaid" status, **When** the owner clicks the "Mark as Paid" button, **Then** the status updates to "Paid" immediately.

---

### User Story 3 - Dojo Configuration (Priority: P2)

As an owner, I want to update the dojo's name and training schedule so that members have up-to-date information.

**Why this priority**: Important for keeping operational details correct, but less critical than security or payments.

**Independent Test**: Update the name/schedule and verify the changes are reflected in the member view.

**Acceptance Scenarios**:

1. **Given** the owner is on the Settings page, **When** they change the Dojo Name and save, **Then** the new name is persisted and displayed throughout the app.
2. **Given** the owner is on the Settings page, **When** they modify the training schedule (e.g., add a session on Monday 7PM) and save, **Then** the updated schedule is available for members to view/book.

---

### User Story 4 - Curriculum Management (Priority: P2)

As an owner, I want to define and organize the training curriculum so that students have a clear progression path.

**Why this priority**: Enhances the training value but the dojo can operate without dynamic curriculum changes initially.

**Independent Test**: Add/reorder items and verify the sequence is correct in the database/UI.

**Acceptance Scenarios**:

1. **Given** the owner is on the Curriculum tab in Settings, **When** they add a new item "Advanced Kendo", **Then** it appears in the list.
2. **Given** a list of curriculum items, **When** the owner drags an item to a new position (reorders), **Then** the new order is saved and reflected in the student view.

### Edge Cases

- What happens when an owner tries to view payments for a future month? (Should show empty or appropriate state)
- What happens if the network fails while updating "Mark as Paid"? (Should show error and revert UI state)
- What happens if the training schedule overlaps? (System should allow or warn, assuming simple list for now)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST restrict READ and WRITE access to `payments` data and dojo modification functions to users with `role='owner'`.
- **FR-002**: System MUST restrict UPDATE access to `dojo` profile (name, config) to users with `role='owner'`.
- **FR-003**: System MUST hide "Payments" and "Settings" navigation elements for users without `role='owner'`.
- **FR-004**: System MUST automatically generate `Unpaid` records for all `active` members at the start of each month (`target_month`).
- **FR-005**: System MUST display a paginated or scrollable list of member payments for a selected month (defaulting to current).
- **FR-006**: System MUST allow filtering the payment list by status: `Unpaid`, `Pending`, `Paid`.
- **FR-007**: System MUST allow the owner to toggle a payment record's status between `Unpaid`, `Pending`, and `Paid`.
- **FR-008**: System MUST allow the owner to update the Dojo Name.
- **FR-009**: System MUST allow the owner to manage fixed training sessions (Name, Start Time, End Time). Changes apply immediately to all associated member profiles.
- **FR-010**: System MUST allow the owner to Create, Read, Update, and Delete (CRUD) `curriculum_items`.
- **FR-011**: System MUST automatically re-sequence `order_index` for `curriculum_items` when an item is added, deleted, or moved.

### Key Entities *(include if feature involves data)*

- **Payment**: Represents a fee status for a user for a specific period (e.g., month). Attributes: `user_id`, `target_month` (YYYY-MM), `status` (enum: 'unpaid', 'pending', 'paid'), `amount`, `paid_at`.
- **Dojo**: The main organization entity. Attributes: `name`.
- **Session**: Fixed training time slots. Attributes: `dojo_id`, `name` (e.g., "5시부"), `start_time` (HH:mm), `end_time` (HH:mm).
- **Curriculum Item**: A unit of training. Attributes: `title`, `description`, `order_index` (integer, sequential), `dojo_id`.
- **User Profile**: Needs `role` attribute ('owner', 'instructor', 'member') and `session_id` (foreign key to Session).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Security**: 100% of access attempts to payment functions from non-owner accounts are rejected (e.g., 403 Forbidden).
- **SC-002**: **Efficiency**: Owners can mark a member as "Paid" in fewer than 3 clicks from the dashboard.
- **SC-003**: **Performance**: Payment list for 100 members loads in under 1 second on standard 4G network.
- **SC-004**: **Functionality**: Changes to curriculum order are reflected in the member view within 2 seconds of saving.