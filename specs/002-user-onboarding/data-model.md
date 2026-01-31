# Data Model: User Onboarding

## Tables

### public.dojos
Represents a Tenant (Dojo).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Unique ID |
| name | text | NOT NULL | Dojo Name |
| owner_id | uuid | FK -> auth.users(id) ON DELETE CASCADE | Owner's User ID |
| default_fee | integer | default 150000 | Default monthly fee |
| trial_ends_at | timestamptz | default now() + 14 days | Trial expiration |
| created_at | timestamptz | default now() | Creation time |

**Changes:**
- Alter FK `owner_id` to `ON DELETE CASCADE`.

### public.profiles
Represents a User within a Dojo.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Unique ID |
| user_id | uuid | FK -> auth.users(id) | Link to Auth User |
| dojo_id | uuid | FK -> dojos(id) ON DELETE CASCADE | Link to Dojo |
| role | text | check in ('owner', 'instructor', 'member', 'guardian') | User Role |
| name | text | NOT NULL | User Name |
| phone | text | | Phone Number (sanitized) |
| is_adult | boolean | default false | Is Adult? |
| guardian_phone | text | | Guardian Phone (if !is_adult) |
| deleted_at | timestamptz | NULLABLE | Soft Delete Timestamp |
| created_at | timestamptz | default now() | Creation time |
| UNIQUE | (dojo_id, phone) | | Unique phone per dojo |

**Changes:**
- Add `deleted_at` column.
- Alter FK `dojo_id` to `ON DELETE CASCADE`.

### public.signup_requests
Pending requests to join a Dojo.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Unique ID |
| dojo_id | uuid | FK -> dojos(id) ON DELETE CASCADE | Target Dojo |
| user_id | uuid | FK -> auth.users(id) | Requesting User |
| name | text | NOT NULL | Applicant Name |
| phone | text | | Applicant Phone |
| guardian_phone | text | | Guardian Phone |
| is_adult | boolean | default false | Is Adult? |
| status | text | default 'pending', check in ('pending', 'approved', 'rejected') | Status |
| created_at | timestamptz | default now() | Request Time |

**Changes:**
- Alter FK `dojo_id` to `ON DELETE CASCADE`.

## Triggers

1.  **sanitize_phone_profiles**: Before INSERT/UPDATE on `profiles`. Removes hyphens.
2.  **sanitize_phone_signup_requests**: Before INSERT/UPDATE on `signup_requests`. Removes hyphens.
3.  **on_signup_approval**: After UPDATE on `signup_requests`.
    - IF `status` becomes 'approved':
        - Check if `profiles` exists for (user_id, dojo_id) with `deleted_at IS NOT NULL`.
        - IF Exists: UPDATE `profiles` SET `deleted_at` = NULL, `role` = 'member', ...
        - ELSE: INSERT into `profiles`.
