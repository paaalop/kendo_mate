# Server Actions: Member Management

## Member List & Search

### `getMembers`
Retrieves a paginated list of members.

- **Input**:
  - `page` (number): 1-based index.
  - `limit` (number): Page size (default 20).
  - `query` (string, optional): Search term (Name or Phone).
- **Output**:
  - `data`: Array of Member objects (id, name, phone, rank, role, avatar_url).
  - `hasMore`: boolean.
- **Permissions**: Owner, Instructor.

### `getMemberDetails`
Retrieves full details for a single member.

- **Input**: `memberId` (string).
- **Output**:
  - `profile`: Full profile object.
  - `rankHistory`: Array of recent promotions.
  - `attendanceStats`: Summary (total count, recent logs).
- **Permissions**: Owner, Instructor.

## Member Management

### `updateMemberProfile`
Updates editable fields.

- **Input**:
  - `memberId` (string)
  - `data`: { name, phone, guardian_phone, etc. }
- **Output**: Updated Profile or Error.
- **Permissions**: Owner Only.

### `softDeleteMember`
Soft deletes a member.

- **Input**: `memberId` (string).
- **Output**: Success/Error.
- **Permissions**: Owner Only.

### `changeMemberRole`
Changes a member's role (Promote/Demote).

- **Input**:
  - `memberId` (string)
  - `role`: 'instructor' | 'member'
- **Output**: Success/Error.
- **Permissions**: Owner Only (via RPC).

### `promoteMember`
Promotes a member to a new rank.

- **Input**:
  - `memberId` (string)
  - `rank`: string (e.g., '1 Dan')
- **Output**: Success/Error.
- **Permissions**: Owner Only (via RPC).

## Signup Request Processing

### `approveSignup`
Approves a pending request.

- **Input**: `requestId` (string).
- **Output**: New Profile ID.
- **Permissions**: Owner Only.

### `rejectSignup`
Rejects a pending request.

- **Input**: `requestId` (string).
- **Output**: Success.
- **Permissions**: Owner Only.
