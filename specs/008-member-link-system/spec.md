# Feature Specification: Member Link System

**Feature Branch**: `008-member-link-system`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "이전의 '가상 프로필(Shadow Profile)' 방식을 폐기하고, "선(先) 생성, 후(後) 연동" 모델을 기반으로 관원 관리 및 부모 연결 기능을 구현하기 위한 상세 명세를 작성해 주세요. **핵심 철학:** 1. **Single Source of Truth:** 데이터의 원천은 도장(Admin)이 생성한 `profiles` 레코드입니다. 부모는 데이터를 생성하지 않고, 이미 존재하는 데이터에 대한 권한(Link)만 가져갑니다. 2. **No Merge Logic:** 복잡한 데이터 병합(Merge) 로직을 제거하고, 단순 `UPDATE`(권한 부여) 만으로 연결을 처리합니다. **상세 요구사항:** 1. **관원 일괄 등록 (Excel Upload):** * **기능:** 관리자(Owner)가 관원 명부 엑셀 파일(이름, 부모 전화번호 필수)을 업로드. * **처리:** `profiles` 테이블에 관원 데이터를 일괄 INSERT. 이때 `guardian_id`는 `NULL`로 설정. * **제약:** 부모가 아직 가입하지 않았더라도 관원 데이터는 정상적으로 생성되고 관리(출석 등)되어야 함. 2. **부모-자녀 자동 매칭 (Auto-Discovery):** * **Trigger:** 부모 계정 가입 또는 로그인 직후(대시보드 진입 시). * **Logic:** `profiles.guardian_phone`이 부모의 인증된 전화번호와 일치하고, `guardian_id`가 `NULL`인 레코드를 조회 (`find_my_children_by_phone` RPC 활용). * **UX:** "회원님의 자녀로 추정되는 [홍길동] 학생이 있습니다. 연결하시겠습니까?" 팝업 -> [연결] 클릭 시 `guardian_id` 업데이트. 3. **데이터베이스 스키마 조정:** * `profiles` 테이블에서 `is_shadow` 컬럼 제거 (또는 Deprecated). * `guardian_id` (UUID, Nullable, FK to auth.users): 연결된 부모 ID. * `guardian_phone` (Text): 매칭을 위한 식별자. 4. **수동 연결 요청 (Fallback):** * 전화번호가 불일치하여 자동 매칭 실패 시, 부모가 이름/도장으로 검색하여 연결 요청(`link_requests`)을 보내는 흐름 포함."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Admin Bulk Student Registration (Priority: P1)

As a Dojo Owner (Admin), I want to upload a list of students via Excel so that I can pre-register them into the system before their parents sign up.

**Why this priority**: This is the foundation of the "Pre-create" model. Without student records, there is nothing for parents to link to.

**Independent Test**: Can be fully tested by uploading a valid Excel file and verifying that new student records appear in the database without any linked guardians.

**Acceptance Scenarios**:

1. **Given** an Excel file containing Student Name, Birth Date, and Guardian Phone Number, **When** the Admin uploads this file, **Then** the system parses the file and creates a Profile record for each student.
2. **Given** the upload is successful, **When** I inspect the created profiles, **Then** no records exist in `profile_guardians` for these profiles and `guardian_phone` matches the uploaded data.
3. **Given** an invalid Excel file (missing required columns), **When** the Admin uploads it, **Then** the system rejects the upload and provides an error message.

---

### User Story 2 - Parent Auto-Discovery & Linking (Priority: P1)

As a Parent, I want to be automatically prompted to link with my child's profile upon logging in, so that I can access their information without manual searching.

**Why this priority**: This delivers the core "Link" value proposition and eliminates friction for the majority of users whose phone numbers match.

**Independent Test**: Create a student profile with a specific phone number, then log in as a user with that phone number and verify the prompt appears and functions.

**Acceptance Scenarios**:

1. **Given** a pre-existing student profile with `guardian_phone` matching the Parent's verified phone number, **When** the Parent logs in or visits the dashboard, **Then** a "Found Child" popup appears displaying the student's name.
2. **Given** the "Found Child" popup, **When** the Guardian clicks "Link", **Then** a new record is created in `profile_guardians` connecting the student to the Guardian.
3. **Given** the "Found Child" popup, **When** the Guardian clicks "Link", **Then** the student profile is added to the Guardian's managed list and remains available for other verified guardians (e.g., another parent) to link as well.

---

### User Story 3 - Manual Link Request (Fallback) (Priority: P2)

As a Parent, I want to manually search for my child and request a link if the auto-discovery fails (e.g., changed phone number), so that I can still connect to my child's profile.

**Why this priority**: Handles edge cases where phone numbers don't match, ensuring all parents can eventually connect.

**Independent Test**: Verify that a parent can search for a student by name/dojo and that a link request record is created upon submission.

**Acceptance Scenarios**:

1. **Given** the auto-discovery did not find a child, **When** the Parent searches for a student by Name and Dojo, **Then** the system displays matching unlinked profiles.
2. **Given** a selected unlinked profile, **When** the Parent sends a "Link Request", **Then** a request record is created for the Admin to review.
3. **Given** a pending link request, **When** the Parent views their status, **Then** they see the request is pending approval.

---

### User Story 4 - Admin Link Request Management (Priority: P2)

As a Dojo Owner (Admin), I want to view and approve/reject manual link requests, so that I can verify the relationship before granting access.

**Why this priority**: Necessary companion to Story 3 to complete the manual linking cycle.

**Independent Test**: Create a pending link request, then log in as Admin to approve it and verify the profile is updated.

**Acceptance Scenarios**:

1. **Given** a pending link request from a Parent, **When** the Admin approves it, **Then** a new record is created in `profile_guardians` connecting the student to that Parent.
2. **Given** a pending link request, **When** the Admin rejects it, **Then** the request status is updated to rejected and the profile remains unlinked.

### Edge Cases

- **Duplicate Phone Numbers**: What happens if multiple students have the same parent phone number? (System should find and offer to link all of them).
- **Already Linked**: What happens if a profile is already linked to the current user? (It should not appear in auto-discovery).
- **Multiple Guardians**: Multiple parents (e.g., both Father and Mother) can link to the same child profile.
- **Parent Phone Change**: What happens if a parent changes their phone number after linking? (Link remains established via the bridge table; the `profiles.guardian_phone` is only used for initial discovery).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow Admins to upload an Excel file (.xlsx/.csv) containing student names, birth dates, and guardian phone numbers.
- **FR-002**: System MUST create or update `profiles` records from the uploaded file. The system MUST use the combination of [Name + Birth Date + Guardian Phone] as a unique identifier to prevent duplicates and handle upserts correctly.
- **FR-003**: System MUST identify potential child matches by comparing the logged-in user's verified phone number with `profiles.guardian_phone` where no link exists in `profile_guardians` for that parent.
- **FR-004**: System MUST present a UI (e.g., Modal/Popup) to the user when matches are found. If multiple students match the same phone number, the UI MUST allow the user to link all of them in a single action.
- **FR-005**: System MUST create a record in `profile_guardians` upon confirmation (Single Source of Truth: Update only, no creation).
- **FR-006**: System MUST allow users to search for unlinked profiles by Student Name and the last 4 digits of the guardian's phone number. To submit a link request, the user MUST also provide the student's Birth Date for verification.
- **FR-007**: System MUST allow users to create a `link_requests` record when claiming a profile manually, including their relationship to the student (e.g., Father, Mother) and the provided Birth Date for Admin verification.
- **FR-008**: System MUST provide an interface for Admins to view, approve, or reject `link_requests`.
- **FR-009**: System MUST prevent Parents from creating new `profiles` records directly; they can only link to existing ones.

### Assumptions

- **Admin Approval**: Manual link requests require Admin approval to prevent unauthorized linking.
- **No Self-Creation**: Parents cannot create new Student Profiles; they must rely on Admin creation or the Link Request process.
- **Phone Formatting**: The system handles phone number normalization (e.g., removing dashes) to ensure accurate matching between the Excel upload and Parent accounts.
- **Existing Accounts**: Parents must have a valid account and phone number to use the Auto-Discovery feature.

### Key Entities *(include if feature involves data)*

- **Profile**: Represents the student/member. Key attributes: `id` (UUID), `name`, `birth_date` (Date), `guardian_phone` (Text, for matching), `is_shadow` column is removed/deprecated.
- **Profile Guardian**: Bridge table linking `profiles` to `auth.users`. Attributes: `profile_id`, `guardian_id` (UUID, FK to Users), `relationship` (Text), `is_primary` (Boolean).
- **Link Request**: Represents a manual request to link a parent to a student. Key attributes: `requestor_id` (Parent), `profile_id` (Student), `relationship` (Text, e.g., "Father"), `status` (Pending/Approved/Rejected).

...

### Session 2026-02-04
- Q: 수동 연결 검색 시 개인정보 보호를 위해 '이름' 외에 추가로 요구할 필수 정보는 무엇인가요? → A: 이름 + 전화번호 뒤 4자리
- Q: 자녀 한 명당 연결 가능한 보호자(Guardian)의 수는 몇 명으로 제한할까요? → A: 다중 보호자 지원 (Bridge Table `profile_guardians` 도입)
- Q: 엑셀 업로드 시 기존에 존재하는(동일 이름+동일 번호) 관원 데이터가 있을 경우 어떻게 처리할까요? → A: 이름 + 부모번호 + 생년월일 조합을 고유 식별자로 사용하여 Upsert
- Q: 수동 연결 요청 시, 부모가 자신의 관계(예: 부, 모, 조부모 등)를 입력하도록 할까요? → A: 관계 정보 입력 필수
- Q: 자동 매칭(Auto-Discovery) 시, 전화번호가 일치하는 자녀가 여러 명일 경우 어떻게 처리할까요? → A: 발견된 모든 자녀 일괄 연결
- Q: 수동 연결 요청 시 보안 강화를 위해 어떤 정보를 추가로 확인할까요? → A: 자녀의 생년월일 입력 필수 (관리자 승인 시 대조용)

### Measurable Outcomes

- **SC-001**: Admins can successfully upload a roster of 50+ students in a single batch operation without errors.
- **SC-002**: 100% of Parents with phone numbers matching `guardian_phone` are presented with the Auto-Discovery prompt upon their first dashboard visit after profile creation.
- **SC-003**: The "Link" action (updating `guardian_id`) completes in under 2 seconds.
- **SC-004**: Parents cannot generate duplicate student profiles; 100% of student data originates from Admin-created records.

