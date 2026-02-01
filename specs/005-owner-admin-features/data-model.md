# Data Model: Owner Admin Features

## Schema Extensions

### 1. `public.payments`
Tracks monthly membership fees.

- **id**: `uuid` (PK)
- **dojo_id**: `uuid` (FK -> dojos.id, ON DELETE CASCADE)
- **user_id**: `uuid` (FK -> profiles.id, ON DELETE CASCADE)
- **target_month**: `date` (First day of month, e.g., '2026-02-01')
- **status**: `text` (Enum: 'unpaid', 'pending', 'paid', default 'unpaid')
- **amount**: `integer` (Optional, defaults to dojo setting or 0)
- **paid_at**: `timestamptz` (Nullable)
- **created_at**: `timestamptz` (Default now())
- **updated_at**: `timestamptz` (Default now())

**Constraints**:
- Unique: `(dojo_id, user_id, target_month)`

### 2. `public.sessions`
Fixed training time slots.

- **id**: `uuid` (PK)
- **dojo_id**: `uuid` (FK -> dojos.id, ON DELETE CASCADE)
- **name**: `text` (e.g., "5시부")
- **start_time**: `time`
- **end_time**: `time`
- **created_at**: `timestamptz`

### 3. `public.curriculum_items`
Training curriculum content.

- **id**: `uuid` (PK)
- **dojo_id**: `uuid` (FK -> dojos.id, ON DELETE CASCADE)
- **title**: `text`
- **description**: `text`
- **order_index**: `integer` (Not Null)
- **created_at**: `timestamptz`

**Constraints**:
- Unique: `(dojo_id, order_index)` (Deferrable preferred, or managed by app logic to avoid temporary collisions)

## RLS Policies

### `payments`
- **Owner**: ALL (SELECT, INSERT, UPDATE, DELETE) WHERE `is_dojo_owner(dojo_id)`
- **Instructor**: SELECT WHERE `is_dojo_staff(dojo_id)` (Optional, if they help manage) - *Spec says restricted to Owner.* -> **NONE** for Instructor.
- **Member**: SELECT WHERE `auth.uid() = user_id` (View own history).

### `sessions`
- **Public/All**: SELECT (Visible to everyone to see schedule).
- **Owner**: ALL (Manage) WHERE `is_dojo_owner(dojo_id)`.

### `curriculum_items`
- **Public/All**: SELECT.
- **Owner**: ALL (Manage) WHERE `is_dojo_owner(dojo_id)`.

## Database Functions (RPC)

### `generate_monthly_payments(target_month)`
- **Input**: `date`
- **Logic**:
    - Iterate all `active` members (where `deleted_at` is NULL).
    - Insert into `payments` if not exists.
- **Security**: SECURITY DEFINER (run by Cron or Owner).

### `reorder_curriculum_item(item_id, new_index)`
- **Input**: `uuid`, `integer`
- **Logic**:
    - Shift other items in the same dojo to make space/close gaps.
    - Update target item.
