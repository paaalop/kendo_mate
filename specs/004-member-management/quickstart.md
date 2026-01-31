# Quickstart: Member Management

## Prerequisites

1.  **Database Migration**: Run the latest migration to add `rank_history` and `partial index`.
    ```bash
    npm run supabase:migrate
    ```

2.  **Seed Data**: Populate the database with dummy members for testing infinite scroll.
    - Check `supabase/seed.sql` for `insert_dummy_members` function or script.
    - Or run: `npm run seed:members` (if script created).

## Testing the Feature

### 1. View Member List
1.  Login as **Owner**.
2.  Navigate to `/members`.
3.  Scroll down to verify **Infinite Scroll** loads more items.
4.  Type in the **Search Bar** to filter by Name or Phone.

### 2. Promote to Instructor
1.  Click on a member (Role: 'member').
2.  In detail view, click **"Manage Role"**.
3.  Select **"Instructor"** and confirm.
4.  Verify the badge changes.
5.  Login as that member and verify they can now see Instructor-only views.

### 3. Soft Delete
1.  As **Owner**, select a member.
2.  Click **"Delete Member"**.
3.  Confirm dialog.
4.  Verify member disappears from list.
5.  Search for the member -> Should NOT appear.
6.  Check DB -> `deleted_at` should be set.

### 4. Signup Requests
1.  Navigate to **Dashboard**.
2.  See "Pending Signups" widget.
3.  Click **"Approve"**.
4.  Verify new member appears in `/members` list.
