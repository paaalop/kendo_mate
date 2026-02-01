# Quickstart: Owner Admin Features

## Prerequisites

1.  **Database Migration**:
    -   Run migrations to create `payments`, `sessions`, `curriculum_items` tables.
    -   `npx supabase migration up` (or strictly `supabase migration up`).

2.  **Seed Data (Optional)**:
    -   Create a user with `role='owner'`.
    -   Create dummy members.

## Testing Role Isolation

1.  **Login as Owner**:
    -   Verify "Payments" and "Settings" tabs appear in Dashboard.
    -   Verify you can see payment list.
2.  **Login as Member/Instructor**:
    -   Verify "Payments" and "Settings" tabs are **hidden**.
    -   Try accessing `/dashboard/payments` directly -> Should redirect or 403.

## Testing Payments

1.  **Initialize**:
    -   Click "Initialize Month" (if UI exists) or wait for Cron.
    -   Verify all members have a row for current month.
2.  **Update**:
    -   Click "Paid" on a member.
    -   Refresh to verify persistence.

## Testing Curriculum

1.  **Add Item**:
    -   Add "Item A", "Item B".
    -   Verify order 1, 2.
2.  **Reorder**:
    -   Drag "Item B" above "Item A".
    -   Refresh. "Item B" should be 1, "Item A" 2.
