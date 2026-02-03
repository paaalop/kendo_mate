# Feature Specification: User Home Dashboard

**Feature Branch**: `006-member-home-dashboard`  
**Created**: 2026-02-02  
**Status**: Draft  
**Input**: User description: "@docs/PRD.md 의 "3. 핵심 기능 상세 명세 - D. 다자녀 연결" 및 "[관원 앱] 탭 1: 내 진도"를 바탕으로 사용자 홈 화면 명세서를 작성해 주세요..."

## Clarifications

### Session 2026-02-02
- Q: 부모가 순수 보호자일 경우 본인 프로필 선택 시 동작은? → A: '보호자 모드'로 전환하여 연결된 모든 자녀의 출석/미납 요약 화면을 보여준다.
- Q: 자녀 프로필 전환 시 권한 범위는? → A: 대시보드(내 진도) 탭의 데이터만 자녀의 것으로 전환(Read-only)되며, 커뮤니티나 설정 등 다른 탭은 부모 본인의 계정 컨텍스트를 유지한다.
- Q: 패밀리 스위처에 표시될 이름 형식은? → A: '이름 (도장명)' 형태로 표시하여 여러 도장에 등록된 경우에도 명확히 구분한다.
- Q: 본인도 관원인 부모의 '보호자 모드' 진입 방식은? → A: 프로필 스위처 가장 처음에 '보호자 요약' 아이콘을 별도로 제공하여 진입한다.
- Q: 한 자녀가 여러 도장에 등록된 경우 표시 방식은? → A: 도장별로 각각 별개의 프로필 카드를 생성하여 나열한다. (예: "홍길동 (A도장)", "홍길동 (B도장)")
- Q: 개인 대시보드 진도 현황의 강조 항목은? → A: 현재 배정된 커리큘럼 항목의 타이틀과 해당 항목의 달성률(%)을 가장 강조하여 표시한다.
- Q: 다자녀 연결(Family Linking) 및 프로필 생성 방식은? → A: 보호자가 자녀의 'Shadow Profile (가상 프로필)'을 직접 생성한 후, 해당 도장에 '연결(입관 확인) 요청'을 보내 관리자가 승인하는 방식을 사용한다. 자녀가 별도의 계정이 없어도 보호자가 관리할 수 있다.
- Q: Shadow Profile (가상 프로필) 연결 요청 승인 시 관리자의 처리 방식은? → A: 관리자가 도장 내 기존 관원 데이터와 Shadow Profile (가상 프로필)을 매칭(Merge)하여 연결할 수 있는 기능을 제공한다.
- Q: 대시보드의 '현재 수련 항목' 결정 로직은? → A: 완료되지 않은(`user_progress`에 없는) 항목 중 `order_index`가 가장 낮은 항목을 자동으로 선정한다.
- Q: 도장 관리자가 연결 요청을 거절할 경우 처리는? → A: Shadow Profile (가상 프로필)은 유지되며 '거절됨' 상태가 표시된다. 보호자는 정보를 수정하여 재요청할 수 있다.
- Q: 도장과 연결된 Shadow Profile (가상 프로필)의 정보 수정 권한은? → A: 연결 완료 후에는 도장 관리자가 정보를 관리(Official Record)하며, 보호자는 조회만 가능하다.
- Q: 보호자 요약 화면의 정보 구성 방식은? → A: 자녀별 요약 카드(이름, 최근 출석일, 미납 금액)를 리스트 형태로 나열하여, 각 자녀의 개별 상태를 한눈에 파악할 수 있도록 한다. 단순 수치 합산은 지양한다.
- Q: Shadow Profile (가상 프로필) 병합 시 기술적 처리 방식은? → A: 기존 관원 레코드의 `owner_id` 필드에 보호자 ID를 업데이트하고, 임시 생성된 Shadow Profile (가상 프로필) 데이터는 삭제/무효화한다.
- Q: 연결된 자녀 프로필의 해제(탈퇴) 방식은? → A: 보호자가 '연결 해제'를 요청하면 도장 관리자가 이를 승인해야 최종적으로 연결이 끊기며, 이 과정에서 도장 측의 관원 상태도 업데이트될 수 있다. 공식 수련 데이터는 도장에 보존된다.
- Q: Shadow Profile (가상 프로필) 연결 승인 시 신규 관원 처리 방식 → A: 기존 기록이 없으면 Shadow Profile (가상 프로필)을 즉시 정식 관원 레코드로 승격(Promote)하여 관리자가 중복 입력할 필요 없게 한다.
- Q: 연결 해제(Unlink) 후 데이터 조회 권한 → A: 연결 해제 즉시 보호자 앱의 대시보드와 패밀리 스위처에서 해당 도장 프로필이 제거되며, 과거 기록 조회가 불가능해진다. (도장 측 기록은 보존)

## User Scenarios & Testing *(mandatory)*
...
### User Story 2 - Family Profile Management (Priority: P1)

As a parent (guardian), I want to create profiles for my children and link them to their respective dojos, so that I can manage their training and payments even if they don't have their own phones or accounts.

**Acceptance Scenarios**:

1. **Given** a logged-in guardian, **When** they add a child's information (Name, Birthdate), **Then** a "Shadow Profile" is created and owned by the guardian.
2. **Given** a shadow profile, **When** the guardian searches and selects a Dojo to "Link", **Then** the Dojo Administrator receives a connection request.
3. **Given** an approved link (merged with existing record if applicable), **When** the guardian views the Family Switcher, **Then** the child's profile (Name + Dojo) appears, and the "Guardian Summary" icon displays their aggregated status.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to create "Shadow Member Profiles" that are not initially linked to an `auth.users` account but are owned by the creator (Guardian).
- **FR-002**: The system MUST provide a flow for Guardians to send "Link Requests" from a Shadow Profile to a specific Dojo. Upon approval, the administrator MUST either:
    - (a) **Merge**: Update an existing member record's `owner_id` with the Guardian's ID and remove the temporary shadow profile.
    - (b) **Promote**: Convert the shadow profile into a formal member record for the dojo if no matching record exists.
- **FR-003**: The UI MUST display a "Family Switcher" for Guardians, starting with a "Guardian Summary" icon, followed by individual profiles (including self and shadow profiles) in "Name (Dojo)" format.
- **FR-004**: Tapping a profile in the Switcher MUST update the **Dashboard Tab context** (Read-only for children/shadow profiles).
- **FR-005**: The "Guardian Summary" screen MUST display a list of summary cards for all linked profiles, showing each member's recent attendance date and current unpaid fee status (Name, Dojo, Last Attendance, Unpaid Amount).
- **FR-006**: The Dashboard MUST display progress for the selected profile: Current Rank, Current Curriculum Item (first uncompleted item by order), and a Progress Bar for that item. (Note: Progress for a single curriculum item is binary for MVP—0% if not started, 100% upon instructor check-off.)
- **FR-007**: The system MUST calculate the "Current Curriculum Item" by finding the first item in the dojo's curriculum that does not have a corresponding entry in `user_progress` for the member.
- **FR-008**: Unlinking a profile MUST follow a "Request-Approval" flow where the Dojo Administrator confirms the disconnection. Once approved, the system MUST immediately revoke the Guardian's access to that member's records and remove the profile from their Switcher. Official training records remain with the Dojo.

### Key Entities *(include if feature involves data)*

- **Member Profile**: Now supports `owner_id` (the Guardian's user ID) and an optional `user_id` (the member's own account if they ever sign up). Linked members are identified by having an `owner_id` matching a Guardian.
- **Link Request**: Tracks the status (Pending/Approved/Rejected) of a connection between a Shadow Profile and a Dojo.
- **Attendance Record, Rank, Curriculum Item, Progress**: (Same as previous, now queryable via shadow profile ID).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Adult users with children can switch profiles in **1 tap**.
- **SC-002**: Dashboard data (attendance/progress) updates within **1 second** of switching profiles.
- **SC-003**: Attendance count displayed matches the database count for the selected member **100%** of the time.
- **SC-004**: Users clearly identify the active profile through a high-contrast border on the avatar and the dashboard title updating to "{Name}님의 진도".