# Feature Specification: Community Features

**Feature Branch**: `007-community-features`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "@docs/PRD.md 의 [관리자 앱] 탭 3: 커뮤니티 및 [관원 앱] 탭 2: 커뮤니티를 바탕으로 커뮤니티 기능 명세서를 작성해 주세요..."

## Clarifications

### Session 2026-02-03
- Q: 데이터 격리 및 가시성 범위 → A: 도장별 독립 운영 (사용자는 소속 도장의 콘텐츠만 접근 가능)
- Q: 콘텐츠 필터링 및 신고 정책 → A: 수동 관리 (사용자 신고 후 관리자가 검토 및 삭제)
- Q: 이미지 업로드 개수 및 용량 제한 → A: 게시글당 사진 최대 1장 (용량 5MB 제한)
- Q: 댓글 시스템의 계층 구조 → A: 2단계 계층 (댓글에 대한 답글 1단계 허용)
- Q: 알림(Notification) 기능 범위 → A: 알림 기능 제외 (인앱 리스트 확인만)
- Q: 게시글 및 댓글 수정 기능 여부 → A: 본인 작성 콘텐츠에 한해 수정 허용 (수정 시 '수정됨' 표시)
- Q: 신고(Report) 데이터 저장 방식 → A: 별도 신고 테이블 생성 (신고자, 사유, 시간 기록)
- Q: 답글(Reply)의 깊이(Depth) 제한 → A: 2단계 계층 (모든 답글은 parent_id로 최상위 댓글 참조)
- Q: 검색 기능의 범위 → A: 제목 + 내용 키워드 검색 지원
- Q: 게시글 삭제 시 관련 데이터 처리 → A: 완전 삭제 (Cascade Delete) - 소속 댓글 및 신고 내역 포함

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Notices (Priority: P1)

All users (members and admins) need to be able to see important announcements from the dojo to stay informed about events and schedules.

**Why this priority**: Notices are the primary communication channel from the dojo to members.

**Independent Test**: Can be tested by creating a notice as an admin and verifying it appears on a member's view.

**Acceptance Scenarios**:

1. **Given** an admin has created a notice, **When** a member opens the community tab, **Then** they see the notice in the list.
2. **Given** a notice is pinned, **When** the list is viewed, **Then** the pinned notice appears at the very top.

---

### User Story 2 - Participate in Free Board (Priority: P1)

Members want to share stories, ask questions, or verify their workouts (Owoonwan) to build a sense of community.

**Why this priority**: This is the core social engagement feature for members.

**Independent Test**: Can be tested by a user creating a post and another user seeing it.

**Acceptance Scenarios**:

1. **Given** a user is on the Free Board, **When** they create a post with text and a category (Free/Question/Exercise), **Then** the post is published and visible to others.
2. **Given** a user is creating a post, **When** they attach a photo, **Then** the photo is displayed with the post.
3. **Given** a list of posts, **When** a user clicks one, **Then** they see the full details and comments.

---

### User Story 3 - Comment Interaction (Priority: P2)

Users want to reply to posts to encourage each other and answer questions.

**Why this priority**: Drive engagement and sustained interaction.

**Independent Test**: Can be tested by posting a comment on an existing post.

**Acceptance Scenarios**:

1. **Given** a post exists, **When** a user submits a comment, **Then** the comment appears immediately at the bottom of the post.

---

### User Story 4 - Administration & Moderation (Priority: P2)

Admins need to manage announcements and moderate content to keep the community safe and organized.

**Why this priority**: Essential for maintaining community standards and flow.

**Independent Test**: Can be tested by an admin deleting a user's post.

**Acceptance Scenarios**:

1. **Given** an admin user, **When** they choose to create a notice, **Then** they can publish it to the Notice Board.
2. **Given** an inappropriate post or comment, **When** an admin clicks delete, **Then** the content is permanently removed.
3. **Given** a user's own post, **When** the user clicks delete, **Then** the post is removed.
4. **Given** an inappropriate post, **When** a member clicks "Report", **Then** the post is flagged for admin review.

### Edge Cases

- What happens when an image upload fails? (Should show error and allow retry)
- What happens if a user tries to delete content they don't own? (Should not be visible or blocked)
- How does the list handle a very large number of posts? (Should use pagination or infinite scroll)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow Admins (Owner/Instructor) to create, edit, and delete Notices within their respective dojo.
- **FR-002**: System MUST allow Admins to "Pin" a Notice within their dojo to keep it at the top of the list.
- **FR-003**: System MUST allow all authenticated users to view Notices belonging to their dojo.
- **FR-004**: System MUST allow all authenticated users to create and edit their own Posts in the Free Board of their dojo.
- **FR-005**: Users MUST select a category for their Post: "Free", "Question", or "Exercise Verification".
- **FR-006**: System MUST allow users to attach at most one image to their Post (optional).
- **FR-007**: System MUST display the list of Posts within the user's dojo with their title, author, category, and creation time.
- **FR-008**: System MUST allow all authenticated users to create and edit their own Comments.
- **FR-009**: System MUST allow users to search for Posts by title or content keywords.
- **FR-010**: System MUST automatically delete all associated comments, likes, and reports when a Post is deleted.
- **FR-011**: System MUST allow users to "Like" a Post or Comment to show engagement.
- **FR-012**: System MUST display an "Edited" label for posts and comments that have been modified after creation.

### Assumptions & Dependencies

- **Assumptions**:
  - Users must be logged in to view, create, or interact with community content.
  - Content visibility and interaction are strictly isolated by `dojo_id` (Multi-tenancy).
  - Image uploads are limited to **one file per post**, restricted to standard formats (JPG, PNG) and max **5MB**.
  - Admin roles (Owner/Instructor) are already established in the system.
  - **Real-time push notifications or in-app alerts for new content are NOT included in the current scope.**
- **Dependencies**:
  - User Authentication system (existing).
  - Role-based access control (RBAC) for distinguishing Admins.
  - Storage service configuration for handling image files.

### Key Entities

- **Notice**: Informational content created by admins. Attributes: Dojo ID, Title, Content, Author, Pinned Status, Created Date, Updated Date.
- **Post**: Community content created by any user. Attributes: Dojo ID, Title, Content, Author, Category, Image URL, Created Date, Updated Date.
- **Comment**: Reply to a post. Attributes: Content, Author, Post ID, Parent ID (nullable), Created Date, Updated Date.
- **PostReport**: Record of inappropriate content reports. Attributes: Post ID, Reporter ID, Reason, Created Date.
- **Like**: User engagement mark. Attributes: Target Type (Post/Comment), Target ID, User ID, Created Date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully create a post with an image in under 1 minute.
- **SC-002**: Pinned notices appear first in the notice list 100% of the time.
- **SC-003**: Comments posted appear on the screen within 2 seconds.
- **SC-004**: Admins can remove reported/bad content within 3 clicks.