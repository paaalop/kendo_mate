# Implementation Plan: Community Features

**Branch**: `007-community-features` | **Date**: 2026-02-03 | **Spec**: `specs/007-community-features/spec.md`
**Input**: Feature specification from `specs/007-community-features/spec.md`

## Summary

Implement a community board system separated by Dojo. Includes Notices (Admin-only), Free Board (User-generated posts with images, likes, and comments).
Key tech: Next.js 16 Server Actions, Supabase Database & Storage, Optimistic UI updates.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16+ (App Router), Supabase JS SDK, Lucide React, Tailwind CSS v4, React Hook Form + Zod  
**Storage**: Supabase Storage (Bucket: `community-images`)  
**Testing**: Manual E2E (Plan), Jest (Unit - if applicable)  
**Target Platform**: Web (Mobile-first Responsive)  
**Project Type**: Web application (Next.js)  
**Performance Goals**: <2s comment appearance, Optimistic updates for likes/comments.  
**Constraints**: Supabase Strict (RLS), Korean UI, Mobile-first.  
**Scale/Scope**: ~4 Screens (List, Detail, Create/Edit), ~5 DB Tables (Notices, Posts, Comments, Reports, Likes).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **Language**: Korean UI/Commit messages? ✅ Yes.
* **Tech Stack**: Next.js 16 + Supabase + Tailwind v4? ✅ Yes.
* **Context**: Mobile-first UI for parents/owners? ✅ Yes.
* **MVP**: Core features (Notices, Posts, Comments, Likes)? ✅ Yes. No real-time notifications per spec.
* **Code Style**: Explicit naming (`Notice`, `Post`, `Like`)? ✅ Yes.

## Project Structure

### Documentation (this feature)

```text
specs/007-community-features/
├── plan.md              # This file
├── research.md          # Database & Storage decisions
├── data-model.md        # Schema & RLS definitions
├── quickstart.md        # Testing guide
└── contracts/           # API/Action signatures
```

### Source Code (repository root)

```text
app/
├── (dashboard)/
│   ├── community/
│   │   ├── page.tsx           # Feed (Notices + Posts)
│   │   ├── [id]/
│   │   │   └── page.tsx       # Post Detail
│   │   └── create/
│   │       └── page.tsx       # Create Post Form
│   └── admin/
│       └── community/
│           ├── notices/       # Owner Notice Management
│           └── reports/       # Report Management (Owner/Instructor)

components/
├── community/
│   ├── post-list.tsx
│   ├── post-card.tsx
│   ├── comment-list.tsx
│   ├── comment-form.tsx
│   └── notice-card.tsx

lib/
├── actions/
│   └── community.ts           # Server Actions (createPost, addComment, etc.)
└── validations/
    └── community.ts           # Zod schemas
```

**Structure Decision**: Integrated into existing `app/(dashboard)` structure.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |