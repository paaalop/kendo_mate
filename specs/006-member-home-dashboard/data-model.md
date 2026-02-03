# Data Model: Member Home Dashboard

## Schema Changes

### `members` (Table Update)
Existing table representing a member in a dojo.
- **New Field**: `owner_id` (uuid, NULLABLE) - References `auth.users(id)`. The guardian who manages this member.
- **New Field**: `is_shadow` (boolean, DEFAULT false) - Helper flag. True if created by guardian and not yet linked to a real user account.

### `link_requests` (New Table)
Tracks requests from guardians to link a shadow profile to a dojo.
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| guardian_id | uuid | FK to `auth.users(id)` |
| target_dojo_id | uuid | FK to `dojos(id)` |
| child_name | text | Name for verification |
| child_birthdate | date | DOB for verification |
| status | text | 'pending', 'approved', 'rejected' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Database Functions (RPC)

### `get_guardian_summary(guardian_uuid)`
Returns a summary list for the dashboard.
- **Input**: `guardian_uuid`
- **Output**: JSON/Table of `{ member_id, name, dojo_name, last_attendance_date, unpaid_count, unpaid_amount }`
- **Logic**: Join `members`, `attendance`, `payments`.

### `get_next_curriculum(member_uuid)`
Returns the next item to learn.
- **Input**: `member_uuid`
- **Output**: `curriculum_item` row.
- **Logic**: Select from `curriculum` where `dojo_id = member.dojo_id` AND `id NOT IN (select item_id from user_progress where user_id = member_uuid)` order by `order_index` limit 1.

## RLS Policies

### `members`
- `SELECT`: Allow if `owner_id = auth.uid()` (Guardian) OR `id = auth.uid()` (Self - if IDs match) OR `dojo_id` managed by admin.
- `UPDATE`: Allow if `owner_id = auth.uid()` AND `is_shadow = true`.

### `link_requests`
- `INSERT`: Authenticated users (Guardians).
- `SELECT`: `guardian_id = auth.uid()` OR `target_dojo_id` IN (admin's dojos).
- `UPDATE`: Dojo Admins only.