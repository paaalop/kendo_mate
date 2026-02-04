# Server Actions Contracts

## 1. Bulk Upload Profiles
**File**: `app/(dashboard)/admin/members/upload/actions.ts`

### `bulkCreateProfiles`
Parses and validates Excel data, then inserts into `profiles`.

**Input**:
```typescript
type BulkProfileData = {
  name: string;
  birth_date: string; // YYYY-MM-DD
  guardian_phone: string; // Normalized
  phone?: string; // Student phone
}[];
```

**Output**:
```typescript
type Result = {
  success: boolean;
  createdCount: number;
  errors: { row: number; message: string }[];
};
```

**Security**:
- Caller must be Dojo Owner/Instructor.
- Validates duplicates (Upsert on Name + Phone + BirthDate).

---

## 2. Auto-Discovery & Linking
**File**: `app/(dashboard)/family/actions.ts`

### `findMyChildren`
Finds profiles matching the current user's phone number that are NOT yet linked.

**Input**: `void` (Uses `auth.uid()` -> `auth.users.phone`)

**Output**:
```typescript
type PotentialChild = {
  id: string;
  name: string;
  dojo_name: string;
  birth_date: string;
};
```

### `linkChild`
Confirms the link between parent and child.

**Input**:
```typescript
{
  profileId: string;
  relationship: string; // e.g., "Father", "Mother"
}
```

**Output**: `Result<{ success: true }>`

**Security**:
- Re-verifies `profiles.guardian_phone === auth.user.phone` before inserting to `profile_guardians`.

---

## 3. Manual Link Request
**File**: `app/(dashboard)/family/link/actions.ts`

### `searchStudent`
Searches for a student to link manually.

**Input**:
```typescript
{
  name: string;
  dojoId: string;
  birthDate: string; // YYYY-MM-DD
}
```

**Output**:
```typescript
type SearchResult = {
  id: string;
  name: string;
  dojo_name: string;
  // Minimal info to confirm identity
} | null;
```

### `createLinkRequest`
Submits a request for Admin approval.

**Input**:
```typescript
{
  profileId: string;
  relationship: string;
}
```

**Output**: `Result<{ requestId: string }>`

---

## 4. Admin Request Management
**File**: `app/(dashboard)/admin/members/requests/actions.ts`

### `approveLinkRequest`
Approves a pending link request.

**Input**: `requestId: string`

**Output**: `Result<{ success: true }>`

**Side Effect**:
- Updates `link_requests.status` = 'approved'.
- Inserts into `profile_guardians`.

### `rejectLinkRequest`
Rejects a pending link request.

**Input**: `requestId: string`

**Output**: `Result<{ success: true }>`
