# Quickstart: Member Home Dashboard

## Prerequisites

1.  **Supabase Local**: Ensure Supabase is running (`npx supabase start`).
2.  **Migrations**: Run the migration for `owner_id` and `link_requests` (see `contracts/schema.sql`).
    - `npx supabase migration new add_family_features`
    - Paste content from `contracts/schema.sql`.
    - `npx supabase db reset` (or `up` if preserving data).

## Environment Setup

Ensure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Running the Feature

1.  **Start App**: `npm run dev`
2.  **Login**: Login as a user (who will be a Guardian).
3.  **Navigate**: Go to `/dashboard`.
    - You should see your own profile (if you are a member).
    - Look for the "Family Switcher" (top left or sidebar).
4.  **Create Shadow Profile**:
    - Click "Add Child" / "Family +".
    - Enter Name and Dojo.
    - Submit.
5.  **Verify**:
    - Check if the new profile appears in the switcher.
    - Select it -> Dashboard updates to show that child's info (mocked/empty if new).
6.  **Link Request**:
    - (If implemented) Click "Link to Dojo" on the shadow profile.

## Testing

- **Unit**: `npm test`
- **Manual**:
  - Login as Parent A. Create Child B.
  - Switch to Child B. Verify Dashboard title says "Child B's Progress".
  - Login as Dojo Admin. Approve Link (if testing full flow).