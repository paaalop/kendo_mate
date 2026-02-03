# Tasks: Community Features

**Feature Branch**: `007-community-features`
**Spec**: `specs/007-community-features/spec.md`

## Phase 1: Setup
> **Goal**: Initialize database schema, storage, and project structure.

- [x] T001 Create migration for community tables (notices, posts, comments, reports, likes) in `supabase/migrations/20260203000004_community_schema.sql`
- [x] T002 Apply migration and generate types using `npx supabase gen types typescript --local > lib/types/database.types.ts`
- [x] T003 Create storage bucket 'community-images' with public read policy in `supabase/migrations/20260203000005_community_storage.sql`
- [x] T004 Create Zod schemas for Notice, Post, and Comment forms in `lib/validations/community.ts` (Include 5MB limit for images)

## Phase 2: Foundational
> **Goal**: Set up shared server actions and types.

- [x] T005 [P] Define shared TypeScript interfaces for Community entities in `lib/types/community.ts` (extending DB types)
- [x] T006 Scaffold empty server actions for community features in `lib/actions/community.ts`
- [x] T007 [P] Create skeleton page for Community Dashboard in `app/(dashboard)/community/page.tsx`

## Phase 3: User Story 1 - View Notices (P1)
> **Goal**: Owners can create notices, and members can view them.

- [x] T008 [US1] Implement `createNotice` and `updateNotice` actions in `lib/actions/community.ts`
- [x] T009 [US1] Implement `getNotices` action with dojo filtering in `lib/actions/community.ts`
- [x] T010 [US1] Create `NoticeCard` component for displaying single notice in `components/community/notice-card.tsx`
- [x] T011 [US1] Implement Owner Notice Management Page (List) in `app/(dashboard)/admin/community/notices/page.tsx`
- [x] T012 [US1] Implement Owner Notice Management Page (List) in `app/(dashboard)/admin/community/notices/[id]/page.tsx`
- [x] T012b [US1] Implement Pin/Unpin toggle functionality in Notice Management UI
- [x] T013 [US1] Implement Notice List section in Member Community Page in `app/(dashboard)/community/page.tsx`

## Phase 4: User Story 2 - Participate in Free Board (P1)
> **Goal**: Members can create posts with images and view the feed.

- [x] T014 [US2] Implement `createPost` and `updatePost` actions with image upload/replacement logic (Max 5MB) in `lib/actions/community.ts`
- [x] T015 [US2] Implement `getPosts` action with pagination support in `lib/actions/community.ts`
- [x] T016 [US2] Create `PostCard` component for feed view (Include "Edited" label and Like button) in `components/community/post-card.tsx`
- [x] T017 [US2] Create `PostList` component to handle feed mapping in `components/community/post-list.tsx`
- [x] T018 [US2] Implement Post Create/Edit Page (Reusable form component) in `app/(dashboard)/community/create/page.tsx` and `app/(dashboard)/community/[id]/edit/page.tsx`
- [x] T019 [US2] Implement Post Detail Page (initial view) in `app/(dashboard)/community/[id]/page.tsx`
- [x] T020 [US2] Update Member Community Page to include `PostList` in `app/(dashboard)/community/page.tsx`
- [x] T020b [US2] Implement Infinite Scroll or "Load More" UI for the Post list
- [x] T020c [US2] Implement `toggleLike` action for Posts and Comments in `lib/actions/community.ts`

## Phase 5: User Story 3 - Comment Interaction (P2)
> **Goal**: Users can discuss posts via comments and replies.

- [x] T021 [US3] Implement `createComment` and `updateComment` (supports reply depth 1) in `lib/actions/community.ts`
- [x] T022 [US3] Implement `getComments` action for a specific post in `lib/actions/community.ts`
- [x] T023 [US3] Create `CommentForm` component in `components/community/comment-form.tsx`
- [x] T024 [US3] Create `CommentList` component (handling recursion/nesting, "Edited" label, and Like button) in `components/community/comment-list.tsx`
- [x] T025 [US3] Integrate Comments section into Post Detail Page in `app/(dashboard)/community/[id]/page.tsx`

## Phase 6: User Story 4 - Administration & Moderation (P2)
> **Goal**: Owners can manage content and handle reports.

- [x] T026 [US4] Implement `deletePost` (Owner/Instructor overrides) including Supabase Storage image cleanup in `lib/actions/community.ts`
- [x] T027 [US4] Implement `reportPost` action in `lib/actions/community.ts`
- [x] T028 [US4] Implement `getReports` action for owners in `lib/actions/community.ts`
- [x] T029 [US4] Update `PostCard` and `PostDetail` with Delete (Owner/Instructor) and Report (User) buttons in `components/community/post-card.tsx`
- [x] T030 [US4] Implement Owner Report Management Page in `app/(dashboard)/admin/community/reports/page.tsx`
- [x] T030b [US4] Implement `deleteComment` action and UI (Owner/Instructor overrides) in Post Detail and Report Management view

## Phase 7: Polish & Cross-cutting
> **Goal**: UX refinements and edge case handling.

- [x] T031 [US2] Implement Search functionality (Server-side filtering via query params) in `app/(dashboard)/community/page.tsx`
- [x] T032 Verify "Pinned" notices appear at top of list in `lib/actions/community.ts`
- [x] T033 Add optimistic UI updates for Comments in `components/community/comment-list.tsx`
- [x] T034 Ensure mobile responsiveness for Post Create form and Detail view in `app/(dashboard)/community/create/page.tsx`
- [x] T035 Verify Cascade Delete (Post deletion removes comments/reports) in database schema

## Dependencies
1. **US1 (Notices)** depends on **Setup** & **Foundational**.
2. **US2 (Free Board)** depends on **Setup** & **Foundational**.
3. **US3 (Comments)** depends on **US2** (needs Posts).
4. **US4 (Admin)** depends on **US2** & **US3** (content to moderate).

## Implementation Strategy
- **MVP**: Complete Phase 1, 2, 3, and 4 (Notices + Basic Posts).
- **Full Feature**: Add Phase 5 (Comments) and 6 (Moderation).
- **Parallelization**: US1 (Notices) and US2 (Posts) are largely independent after Setup.
