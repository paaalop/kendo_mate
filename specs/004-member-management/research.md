# Research: Member Management

## 1. Testing Infrastructure
**Status**: Resolved
**Decision**: Adopt **Jest + React Testing Library** for Unit/Integration and **Playwright** for E2E.
**Rationale**:
- `__tests__` and `e2e` directories already exist, implying this structure was intended.
- `package.json` currently lacks these dependencies.
- Jest is the most documented and stable choice for Next.js, though Vitest is an alternative. Sticking to Jest aligns with standard `create-next-app` templates unless configured otherwise.
- Playwright is the industry standard for E2E.

**Action Items**:
- Add devDependencies: `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/dom`, `@playwright/test`.
- Create `jest.config.ts` and `playwright.config.ts`.

## 2. Infinite Scroll Implementation
**Status**: Resolved
**Decision**: **Server Action + Client Component with IntersectionObserver**.
**Rationale**:
- **MVP Mindset**: Avoid adding heavy state management libraries (TanStack Query) for a single list.
- **Performance**: Initial load is Server Side Rendered (SSR) for speed. Subsequent pages loaded via Server Action (efficient).
- **Implementation**:
  - `MemberList` (Client Component): Manages `members` state.
  - `loadMoreMembers` (Server Action): Returns next page of data.
  - `useIntersectionObserver` (Hook): Triggers load when sentinel is visible.

## 3. Soft Delete & Unique Constraints
**Status**: Resolved
**Decision**: **PostgreSQL Partial Unique Index**.
**Rationale**:
- We need to allow a phone number to be reused if the previous owner was soft-deleted.
- Standard unique constraints would block this.
- **Solution**: Replace the standard unique constraint on `phone` (and `email` if applicable) with a partial index:
  ```sql
  CREATE UNIQUE INDEX profiles_phone_key ON profiles (phone) WHERE deleted_at IS NULL;
  ```
- This ensures active members have unique phones, but deleted members don't conflict.

## 4. Role Management Permissions (RLS)
**Status**: Resolved
**Decision**: **Supabase Custom Claims or Table Column Check**.
**Rationale**:
- Storing role in `profiles` table is simple (MVP).
- **RLS Policy**:
  - `UPDATE` on `profiles`: Allowed if `auth.uid()` is an Owner.
  - **Self-Demotion Protection**: Application logic should prevent the UI button from appearing. RLS can enforce `CHECK (auth.uid() != id OR new.role = old.role)` if strict security is needed, but preventing the UI action is P0.
  - **Security**: Only Owners can write to `role` column. This might require a database function or separate RPC if we want to be very strict (since standard RLS apply to the whole row usually, though Column Level Privileges exist).
  - **Approach**: Use a Database Function `promote_member` / `demote_member` with `SECURITY DEFINER` to handle role changes safely, checking the caller's role. This is safer than exposing direct table updates for sensitive fields.

**Refinement**: Using a Postgres Function (RPC) for role changes is safer and cleaner than complex RLS for specific columns.
**Decision**: Use RPC `update_member_role` for FR-006.
