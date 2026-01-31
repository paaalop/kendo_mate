# Feature Specification: Setup Database Schema and Auth

**Feature Branch**: `001-setup-db-schema`
**Created**: 2026-01-30
**Status**: Draft
**Input**: User description: "@docs/PRD.md 의 ..."

## Clarifications

### Session 2026-01-30
- Q: Which migration tool should be used? → A: Supabase CLI (SQL Migrations).
- Q: Where should phone number sanitization logic be handled? → A: Database Trigger (PostgreSQL).
- Q: How should the initial 'owner' account (Admin) be created? → A: SQL Seed Script (auth.users & profiles).
- Q: How should the unique constraint for phone numbers in the `profiles` table be applied? → A: Unique per Dojo (dojo_id + phone).
- Q: Can the same user apply multiple times to the same dojo? → A: No (prevent duplicate requests).
- Q: Should a storage bucket be created for community post images? → A: Yes, create a public 'images' bucket via script.
- Q: How should default fees be handled per Dojo? → A: Add `default_fee` to `dojos` table to allow per-dojo customization.
- Q: Should Instructors have access to payment data even in MVP? → A: No, RLS should restrict `instructor` role from accessing `payments` table.
- Q: What is the scope of the `is_pinned` flag in notices? → A: Global per Dojo; pinned by admins to show at the top for all members.
- Q: Should post categories be strictly enforced in the database? → A: Yes, apply a CHECK constraint for ('free', 'qna', 'cert').
- Q: Which authentication methods should be supported in MVP? → A: Email and Password (for speed and cost-efficiency).
- Q: How should parents/guardians be distinguished from students? → A: Add a 'guardian' role to the `profiles` table.
- Q: Should the specification include full column definitions for all tables? → A: Yes, synchronize with the PRD definitions.
- Q: How should the payment amount be determined when creating a record? → A: Copy the current `dojos.default_fee` to the `payments.amount` field at creation time to ensure data integrity.
- Q: What values should be used for `curriculum_items.category` and `attendance_logs.check_type`? → A: category: ('basic', 'technique', 'sparring'), check_type: ('manual', 'qr', 'face').
- Q: How should a profile be created when a signup request is approved? → A: Automatically via a Database Trigger when `signup_requests.status` changes to 'approved'.
- Q: How should payments be handled when a profile is deleted? → A: Keep records (Set Null or Restrict).

## User Scenarios & Testing

### User Story 1 - Database Schema Initialization (Priority: P1)

As a developer, I want the database schema to be automatically created so that the application has a structured place to store data.

**Why this priority**: Foundational for all other features.

**Independent Test**: Run the migration script against a clean Supabase instance and verify table existence.

**Acceptance Scenarios**:

1. **Given** a clean Supabase database, **When** the migration script is executed, **Then** tables `dojos`, `profiles`, `signup_requests`, `curriculum_items`, `user_progress`, `attendance_logs`, `payments`, `notices`, `posts`, and `comments` exist.
2. **Given** the tables are created, **When** I inspect the columns, **Then** they match the detailed data requirements (types, constraints).

### User Story 2 - Basic Security Configuration (RLS) (Priority: P1)

As a system owner, I want Row Level Security (RLS) enabled on all tables so that we have a security framework in place, even if initially permissive.

**Why this priority**: Security must be baked in from the start to prevent accidental exposure later.

**Independent Test**: Verify RLS is enabled on all tables via SQL query.

**Acceptance Scenarios**:

1. **Given** the database schema, **When** I check table properties, **Then** RLS is enabled for all 10 tables.
2. **Given** RLS is enabled, **When** an anonymous or authenticated user queries data, **Then** they can access it (due to MVP `true` policy).

### User Story 3 - Phone Number Sanitization (Priority: P2)

As a system administrator, I want phone numbers to be stored in a standard format (no hyphens) so that search and lookup are consistent.

**Why this priority**: Data integrity for the primary lookup key (phone number).

**Independent Test**: Insert a record with hyphens and verify the stored value.

**Acceptance Scenarios**:

1. **Given** a user input of `010-1234-5678`, **When** the data is inserted into `profiles` or `signup_requests`, **Then** it is stored as `01012345678`.

### User Story 4 - Initial Data Seeding (Priority: P3)

As a tester, I want the database to be populated with default curriculum and an admin account so that I can immediately start testing the application.

**Why this priority**: Facilitates rapid testing and onboarding.

**Independent Test**: Check `curriculum_items` and `profiles` after seeding.

**Acceptance Scenarios**:

1. **Given** a fresh database, **When** the seed script runs, **Then** `curriculum_items` table contains the default Kendo curriculum.
2. **Given** the seed script runs, **When** I query `auth.users` and `profiles`, **Then** a default admin account exists.

## Requirements

### Functional Requirements

#### Database Schema Design
The system MUST implement the following data entities and storage structures using **Supabase CLI (SQL Migrations)**:

**1. dojos** (Tenants)
- `id`: UUID (Primary Key, Auto-generated)
- `name`: Text (Required)
- `owner_id`: UUID (Required, Links to auth system)
- `default_fee`: Integer (Default: 150000)
- `trial_ends_at`: Timestamp (Default: +14 days)
- `created_at`: Timestamp (Default: Now)

**2. profiles** (Users)
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key: auth.users, Nullable)
- `dojo_id`: UUID (Foreign Key: dojos)
- `role`: Text (Default: 'member', CHECK: 'owner', 'instructor', 'member', 'guardian')
- `name`: Text (Required)
- `phone`: Text (Sanitized, Index)
- `rank_level`: Integer (Default: 0)
- `rank_name`: Text (Default: '무급')
- `default_session_time`: Text
- `is_adult`: Boolean (Default: False)
- `guardian_name`: Text
- `guardian_phone`: Text (Sanitized, Index)
- `created_at`: Timestamp

**3. signup_requests** (Onboarding)
- `id`: UUID (Primary Key)
- `dojo_id`: UUID (Foreign Key: dojos)
- `user_id`: UUID (Foreign Key: auth.users)
- `name`: Text (Required)
- `phone`: Text
- `guardian_phone`: Text
- `is_adult`: Boolean (Default: False)
- `status`: Text (Default: 'pending', CHECK: 'pending', 'approved', 'rejected')
- `created_at`: Timestamp

**4. curriculum_items** (Curriculum)
- `id`: UUID (Primary Key)
- `dojo_id`: UUID (Foreign Key: dojos)
- `title`: Text (Required)
- `category`: Text (CHECK: 'basic', 'technique', 'sparring')
- `order_index`: Integer (Required)
- `required_rank_level`: Integer
- `created_at`: Timestamp

**5. user_progress** (Progress)
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key: profiles)
- `item_id`: UUID (Foreign Key: curriculum_items)
- `status`: Text (Default: 'completed')
- `completed_at`: Timestamp
- **Constraint**: Unique combination of user_id and item_id

**6. attendance_logs** (Attendance)
- `id`: UUID (Primary Key)
- `dojo_id`: UUID (Foreign Key: dojos)
- `user_id`: UUID (Foreign Key: profiles)
- `attended_at`: Timestamp (Default: Now)
- `check_type`: Text (Default: 'manual', CHECK: 'manual', 'qr', 'face')
- `created_at`: Timestamp

**7. payments** (Payments)
- `id`: UUID (Primary Key)
- `dojo_id`: UUID (Foreign Key: dojos)
- `user_id`: UUID (Foreign Key: profiles, On Delete: Set Null)
- `target_month`: Text (Required, Format: 'YYYY-MM')
- `amount`: Integer (Required, Inherit from `dojos.default_fee` at record creation)
- `payment_date`: Timestamp
- `status`: Text Enum ('unpaid', 'pending', 'paid') (Default: 'unpaid')
- `created_at`: Timestamp
- **Constraint**: Unique combination of user_id and target_month

**8. notices** (Notices)
- `id`: UUID (Primary Key)
- `dojo_id`: UUID (Foreign Key: dojos)
- `author_id`: UUID (Foreign Key: profiles)
- `title`: Text (Required)
- `content`: Text (Required)
- `is_pinned`: Boolean (Default: False) - When True, displays at the top for all members of the Dojo.
- `created_at`: Timestamp

**9. posts** (Community Posts)
- `id`: UUID (Primary Key)
- `dojo_id`: UUID (Foreign Key: dojos)
- `author_id`: UUID (Foreign Key: profiles)
- `category`: Text (Default: 'free') - **Constraint**: CHECK (category IN ('free', 'qna', 'cert'))
- `title`: Text (Required)
- `content`: Text (Required)
- `image_url`: Text
- `view_count`: Integer (Default: 0)
- `created_at`: Timestamp

**10. comments** (Community Comments)
- `id`: UUID (Primary Key)
- `post_id`: UUID (Foreign Key: posts, Delete Cascade)
- `author_id`: UUID (Foreign Key: profiles)
- `content`: Text (Required)
- `created_at`: Timestamp

#### Security Policies (RLS)
- **FR-SEC-01**: Row Level Security (RLS) MUST be enabled on all 10 tables defined above.
- **FR-SEC-02**: The initial RLS policy MUST allow ALL operations (SELECT, INSERT, UPDATE, DELETE) for ALL users by default, EXCEPT for the `payments` table where role-based restrictions apply.
- **FR-SEC-03**: Policy definitions MUST include comments describing future restrictions (e.g., "Future: Owner only access", "Future: User sees only own data").
- **FR-SEC-04**: **Instructor Payment Restriction**: The `payments` table MUST have an RLS policy that explicitly denies access to users with the `instructor` role.

#### Data Logic & Roles
- **FR-LOG-01**: **Sanitization**: When saving `phone` or `guardian_phone` in `profiles`, the system MUST remove all hyphens ('-') automatically via **PostgreSQL Triggers**.
- **FR-LOG-02**: **Profile Creation**: When a `signup_requests` record's status is updated to 'approved', the system MUST automatically create a corresponding record in the `profiles` table using a **PostgreSQL Trigger**.
- **FR-ROLE-01**: **Role Definition**: The `profiles` table MUST support the following roles via the `role` column:
    - `owner`: Represents a Dojo owner.
    - `instructor`: Represents an instructor.
    - `member`: Represents a regular student/member.
    - `guardian`: Represents a parent or guardian of a member.

#### Storage
- **FR-STOR-01**: **Images Bucket**: A public Supabase Storage bucket named `images` MUST be created to store community post uploads.
- **FR-STOR-02**: **Public Access Policy**: The `images` bucket MUST have a policy allowing public read access and authenticated upload access.

#### Seeding
- **FR-SEED-01**: **Curriculum**: The database MUST be seeded with a standard set of Kendo curriculum items (e.g., '3동작 머리치기') for testing.
- **FR-SEED-02**: **Admin**: The database MUST be seeded with a default 'owner' user account and a corresponding 'dojo' record via **SQL Seed Script**.

### Key Entities

- **Dojo**: The gym or organization unit.
- **Profile**: A user's extended information within a Dojo.
- **SignupRequest**: A temporary record for users requesting to join.
- **CurriculumItem**: An educational unit or skill to be mastered.
- **UserProgress**: A record of a user completing a curriculum item.
- **AttendanceLog**: A record of a user's presence.
- **Payment**: A record of dues or fees.
- **Notice**: An announcement from the Dojo.
- **Post/Comment**: Community interactions.

### Edge Cases

- **EC-001**: **Duplicate Phone Numbers**: Enforce uniqueness on the `(dojo_id, phone)` pair in `profiles`. If a user attempts to join a *different* dojo with the same phone, it is allowed.
- **EC-002**: **Missing Profile**: If a user exists in Auth but not in Profiles (e.g., migration error), system should handle this state (though creating profile is part of signup).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Database setup script runs successfully (Exit code 0) on a fresh Supabase project.
- **SC-002**: 10 tables exist in the `public` schema.
- **SC-003**: 100% of tables have RLS enabled.
- SC-004: Inserting '010-1234-5678' into profile phone field results in '01012345678' stored.
- SC-005: `curriculum_items` table contains at least 5 default records after seeding.
- SC-006: 'images' storage bucket exists and allows public read access.
