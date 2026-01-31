# Data Model: Member Management

## Tables

### public.profiles (Update)
Existing table.

**Changes:**
- **Index**: Drop existing unique constraint on `(dojo_id, phone)`.
- **Index**: Create partial unique index `idx_profiles_phone_active` on `(dojo_id, phone) WHERE deleted_at IS NULL`.
- **Policy**: Ensure RLS hides rows where `deleted_at IS NOT NULL` for general queries, but allows Owners to see them if needed (though Spec says "deleted members MUST be excluded from the default member list"). Usually best to handle filtering in application or via a View, but RLS `deleted_at IS NULL` is safest for Soft Delete pattern unless "Restore" feature is needed.
  - *Refinement*: The Spec says "Data preserved". If RLS hides it, we can't see it to restore (if ever needed). But for now, "excluded from default list" implies `SELECT * FROM profiles WHERE deleted_at IS NULL`. RLS can remain open for Owners but application filters.

### public.rank_history (New)
Tracks promotion history.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Unique ID |
| dojo_id | uuid | FK -> dojos(id) ON DELETE CASCADE | Dojo Context |
| user_id | uuid | FK -> profiles(id) ON DELETE CASCADE | Target Member |
| previous_rank | text | | Rank before promotion |
| new_rank | text | NOT NULL | Rank after promotion |
| promoted_by | uuid | FK -> profiles(id) | Who promoted (Owner) |
| promoted_at | timestamptz | default now() | Timestamp |

## Database Functions (RPC)

### `update_member_role`
Securely updates a member's role.

- **Params**: `target_member_id` (uuid), `new_role` (text)
- **Logic**:
  - Check if `auth.uid()` is an 'owner' of the dojo matching `target_member_id`.
  - Check if `target_member_id` != `auth.uid()` (Prevent self-demotion).
  - Update `profiles.role`.

### `promote_member`
Updates rank and logs history.

- **Params**: `target_member_id` (uuid), `new_rank` (text)
- **Logic**:
  - Check permissions.
  - Get current rank as `old_rank`.
  - Update `profiles` set `rank_name` = `new_rank`.
  - Insert into `rank_history`.

## Triggers

### `prevent_duplicate_phone_active`
(Handled by Partial Index, no trigger needed)
