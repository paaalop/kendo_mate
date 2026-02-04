# Research: Member Link System

**Feature**: Member Link System (008)
**Status**: Resolved

## 1. Excel Parsing Strategy

**Decision**: Client-side parsing using `xlsx` (SheetJS).

**Rationale**:
- **Speed**: Immediate feedback to Admin without uploading files to server/storage.
- **Simplicity**: No need for `multipart/form-data` handling or temporary file storage on server.
- **Flow**:
  1. Admin selects file.
  2. Browser (Client) parses `.xlsx` to JSON.
  3. Client calls Server Action `bulkCreateProfiles(data)`.
  4. Server validates and inserts/upserts.

**Alternatives Considered**:
- **Server-side parsing**: Requires file upload mechanism. Slower interaction.
- **CSV only**: Less user friendly for Admins who use Excel.

## 2. Auto-Discovery & Linking Logic

**Decision**: RPC `find_potential_children` + Server Action `link_child`.

**Rationale**:
- **Security**: Phone number verification must happen on the server.
- **Logic**:
  - `find_potential_children`:
    - Inputs: `user_phone` (extracted from Auth token/metadata securely).
    - Query: `SELECT * FROM profiles WHERE guardian_phone = user_phone AND id NOT IN (linked_profiles)`.
  - `link_child`:
    - Inputs: `profile_id`.
    - Logic: Verify `guardian_phone` matches current user's phone again. Insert into `profile_guardians`.
    - RLS: Users cannot directly INSERT to `profile_guardians` unless via this secure function (or RLS policy checks phone match, but RPC is cleaner for "action").

## 3. Data Model Adjustments

**Decision**:
- **Profiles Table**:
  - Add `guardian_phone` (text).
  - Add `birth_date` (date) - for matching and manual verification.
  - Remove/Ignore `is_shadow`.
- **ProfileGuardians Table** (New):
  - `id` (uuid, PK)
  - `profile_id` (uuid, FK profiles)
  - `guardian_id` (uuid, FK auth.users)
  - `relationship` (text)
  - `is_primary` (boolean)
  - Constraint: Unique `(profile_id, guardian_id)`.
- **LinkRequests Table** (New):
  - `id`, `guardian_id`, `profile_id`, `status` ('pending', 'approved', 'rejected'), `relationship`.
  - Used when Auto-Discovery fails.

## 4. Manual Search Security

**Decision**: Search requires `Name` + `Dojo` + `BirthDate` (exact match).

**Rationale**:
- Privacy: Cannot expose list of all students.
- Logic: Parent enters Name, Dojo, DOB. System looks for exact match.
- If found: Show basic info (Name, Dojo) and allow "Request Link".
- If not found: Show "Contact Admin".

## 5. UI/UX for "Found Child"

**Decision**: Global `AutoLinkModal` in `(dashboard)/layout.tsx`.

**Rationale**:
- Immediate prompt upon login.
- Checks status via `useSWR` or `useEffect` calling the discovery RPC.
- If found, blocks/modals the user to Confirm or Dismiss.

## 6. Library for Excel

**Decision**: `xlsx` (https://www.npmjs.com/package/xlsx).

**Rationale**: Standard, widely used, reliable.

## 7. RLS Policies

**Decision**:
- `profiles`:
  - SELECT: Allowed if `id` in `profile_guardians.profile_id` where `guardian_id = auth.uid()`.
  - SELECT (Admin): Allowed if `dojo_id` matches admin's dojo.
- `profile_guardians`:
  - SELECT: `guardian_id = auth.uid()` OR `profile.dojo.owner_id = auth.uid()`.
  - INSERT: Only via Trusted RPC/Server Action (or Policy: `guardian_phone` on profile matches user phone).
