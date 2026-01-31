# Research: User Onboarding and Registration

## Technical Decisions

### 1. Database Schema Updates
**Decision:** Modify existing schema to support requirements.
**Rationale:**
- `profiles` needs `deleted_at` for Soft Delete (FR-009).
- Foreign Keys need `ON DELETE CASCADE` to support FR-020 (Owner delete -> Wipe dojo).
- `dojos.owner_id` -> `auth.users(id) ON DELETE CASCADE`
- `profiles.dojo_id` -> `dojos(id) ON DELETE CASCADE`
- `signup_requests.dojo_id` -> `dojos(id) ON DELETE CASCADE`

### 2. Row Level Security (RLS) Strategy
**Decision:** Implement strict RLS policies replacing the current "Enable all access".
**Rationale:**
- **Dojos:**
  - `INSERT`: Authenticated users only.
  - `SELECT`: Public (for search).
  - `UPDATE`: Owner only.
  - `DELETE`: Owner only.
- **Profiles:**
  - `INSERT`: Trigger based (for members) or Owner (for creating Dojo).
  - `SELECT`: Owner (all members), Self (own profile).
  - `UPDATE`: Owner (promote/demote), Self (some fields).
  - `DELETE`: Owner only (Soft delete).
- **Signup Requests:**
  - `INSERT`: Authenticated users (if not already member).
  - `SELECT`: Owner (view requests), Self (view own status).
  - `UPDATE`: Owner (approve/reject), Self (cancel).

### 3. Onboarding Flow (Frontend)
**Decision:** Use a multi-step Wizard for Dojo Setup.
**Rationale:**
- Step 1: Sign Up (Auth).
- Step 2: "Create Dojo" or "Join Dojo" selection.
- Step 3 (Create): Input Dojo Name, Owner Name, Phone.
- Step 3 (Join): Search Dojo -> Input Member Details.

### 4. Phone Number Normalization
**Decision:** Handle in UI (Input Mask) AND Backend (Trigger).
**Rationale:**
- UI provides immediate feedback and formats for display (`010-1234-5678`).
- Backend Trigger (`sanitize_phone` existing) ensures data integrity (`01012345678`).
- Conforms to FR-008.

### 5. Soft Delete Handling
**Decision:** Use `deleted_at` timestamp.
**Rationale:**
- RLS policies for `SELECT` should exclude `deleted_at IS NOT NULL` by default.
- "Approve" logic in trigger needs to check for existing soft-deleted profile and update it (set `deleted_at = NULL`) instead of insert.

## Clarifications Resolution
All clarifications from Spec are resolved.
- **Role Management:** Handled via `profiles.role`.
- **Search:** `ilike` query on `dojos` table.
- **Cascade Delete:** Implemented via Foreign Key constraints.
