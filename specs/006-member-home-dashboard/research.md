# Research: Member Home Dashboard & Family Linking

## Design Decisions

### 1. Shadow Profiles & Guardian Relationship
- **Decision**: Introduce `owner_id` (UUID) to `members` table to link "Shadow Profiles" to a Guardian (`auth.users`).
- **Rationale**: Allows guardians to manage children who don't have accounts. Spec clarification confirms this approach.
- **Alternatives Considered**: Separate `family_links` table. Rejected because `members` table already holds profile data; direct ownership is simpler for MVP.

### 2. Family Switcher & State Management
- **Decision**: Use URL query parameter (e.g., `?profileId=...`) or persistent Cookie for the active profile context.
- **Rationale**: URL parameter allows deep linking and works well with Server Components (fetching data based on `searchParams`).
- **Implementation**: `layout.tsx` checks param/cookie, fetches data for that profile.
- **Security**: RLS must ensure `auth.uid()` matches `owner_id` (for shadow) or `user_id` (for self) to allow viewing/switching.

### 3. Dashboard Logic (Current Curriculum)
- **Decision**: Calculate "Next Curriculum Item" via SQL/RPC.
- **Rationale**: "First item in curriculum NOT in user_progress". Doing this in DB is more efficient than fetching all and filtering in JS.
- **Query**: `SELECT * FROM curriculum WHERE id NOT IN (SELECT curriculum_id FROM user_progress WHERE user_id = :uid) ORDER BY order_index LIMIT 1`.

### 4. Link Request Flow
- **Decision**: `link_requests` table to manage "Shadow -> Real Dojo" handshake.
- **Rationale**: Needs approval step.
- **Fields**: `guardian_id`, `target_dojo_id`, `child_name`, `child_birthdate`, `status` (pending/approved/rejected).

## Unknowns Resolved

- **Guardian Summary View**: Resolved in Spec (List of cards with attendance/unpaid).
- **Merge Strategy**: Resolved in Spec (Update `owner_id` of existing member or promote shadow).

## Best Practices (Tech Stack)

- **Supabase**: Use RLS for all data access. No "Admin API" bypass unless strictly necessary (e.g. initial setup).
- **Next.js**: Use Server Actions for mutations (Create Profile, Link Request). Use Server Components for fetching.