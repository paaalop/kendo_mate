# Tasks: Member Link System

**Feature**: Member Link System (008)
**Status**: Todo
**Branch**: `008-member-link-system`

## Phase 1: Setup
**Goal**: Initialize project dependencies and database schema.
- [x] T001 Install `xlsx` package for Excel parsing
- [x] T002 Create migration `supabase/migrations/20260204_member_link_system.sql` (Update profiles, Add profile_guardians, link_requests, RLS)
- [x] T003 Apply migration and regenerate types (`database.types.ts`)

## Phase 2: Foundational
**Goal**: Shared utilities and validation logic.
- [x] T004 Create `lib/utils/excel.ts` for client-side Excel parsing logic
- [x] T005 [P] Create validation schemas in `lib/validations/member.ts` (BulkUpload, LinkRequest schemas)

## Phase 3: Admin Bulk Student Registration (P1)
**Goal**: Admins can upload student lists via Excel.
**Story**: [US1] Admin Bulk Student Registration
- [x] T006 [US1] Implement `bulkCreateProfiles` action in `app/(dashboard)/admin/members/upload/actions.ts`
- [x] T007 [P] [US1] Create `components/admin/bulk-upload-form.tsx` with file picker and preview
- [x] T008 [US1] Create Page `app/(dashboard)/admin/members/upload/page.tsx` integrating the form

## Phase 4: Parent Auto-Discovery & Linking (P1)
**Goal**: Parents are automatically prompted to link to their children.
**Story**: [US2] Parent Auto-Discovery
**Dependencies**: US1 (Student profiles must exist)
- [x] T009 [US2] Implement `findMyChildren` and `linkChild` actions in `app/(dashboard)/family/actions.ts`
- [x] T010 [P] [US2] Create `components/family/auto-link-modal.tsx` (UI for "Found Child")
- [x] T011 [US2] Integrate `AutoLinkModal` into `app/(dashboard)/family/layout.tsx`

## Phase 5: Manual Link Request (P2)
**Goal**: Fallback mechanism for parents to manually find and request linking.
**Story**: [US3] Manual Link Request
- [x] T012 [US3] Implement `searchStudent` and `createLinkRequest` actions in `app/(dashboard)/family/link/actions.ts`
- [x] T013 [P] [US3] Create `components/family/link-request-form.tsx` (Search + Request UI)
- [x] T014 [US3] Create Page `app/(dashboard)/family/link/page.tsx`

## Phase 6: Admin Link Request Management (P2)
**Goal**: Admins can view and manage pending link requests.
**Story**: [US4] Admin Link Request Management
**Dependencies**: US3 (Requests must exist to be managed)
- [x] T015 [US4] Implement `approveLinkRequest` and `rejectLinkRequest` actions in `app/(dashboard)/admin/members/requests/actions.ts`
- [x] T016 [P] [US4] Create `components/admin/link-request-card.tsx` (Review UI)
- [x] T017 [US4] Create Page `app/(dashboard)/admin/members/requests/page.tsx` listing pending requests

## Phase 7: Polish
**Goal**: Finalize UX and Security.
- [x] T018 Verify RLS policies (Ensure parents can't see unlinked profiles without specific search)
- [x] T019 Verify Mobile Responsiveness for Guardian views
- [x] T020 Clean up any temporary logs or TODOs
- [x] T021 [SC-003] Verify linking action performance (< 2s) under realistic load

## Implementation Strategy
- **MVP**: Complete Phase 1-4. This enables the primary "Happy Path" (Admin Upload -> Auto Link).
- **Full**: Complete Phase 5-6 to handle edge cases (Phone mismatch).
- **Parallel**: Frontend components (Forms/Modals) can be built in parallel with Server Actions once schemas are defined in Phase 2.