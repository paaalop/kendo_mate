# Implementation Plan: Member Link System

**Branch**: `008-member-link-system` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/008-member-link-system/spec.md`

## Summary

This feature implements the "Pre-create, then Link" model for managing dojo members and their guardians.
Key components:
1.  **Excel Upload**: Admin uploads student roster (Name, Birthdate, Parent Phone). System creates unlinked `profiles`.
2.  **Auto-Discovery**: Parents are prompted to link to children based on matching phone numbers upon login.
3.  **Manual Link**: Parents can search and request linkage if auto-discovery fails.
4.  **Admin Management**: Admins approve/reject link requests.
5.  **Data Model**: Introduces `profile_guardians` bridge table for N:M relationships and updates `profiles` to support the linking process.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16.1.6 (App Router), Supabase JS, Tailwind CSS v4, Lucide React, Radix UI, React Hook Form, Zod, xlsx (New)
**Storage**: PostgreSQL 15+ (Supabase)
**Testing**: `npm test` (Jest/RTL)
**Target Platform**: Web (Mobile-first)
**Project Type**: Web Application
**Performance Goals**: Link action < 2s, Bulk upload 50+ records < 5s
**Constraints**: Mobile-first UI for parents, strict Supabase RLS policies
**Scale/Scope**: ~100s of students per dojo, minimal concurrency issues

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **Language & Communication**: All UI/Commits in Korean. (Checked)
*   **MVP Mindset**: Simple flow (Upload -> Link). No complex merge logic. (Checked)
*   **Context Awareness**: Large buttons for parents/owners. (Checked)
*   **Tech Stack**: Next.js 16, Tailwind v4, Supabase Only. (Checked)
*   **Component Strategy**: Server Components default. (Checked)

## Project Structure

### Documentation (this feature)

```text
specs/008-member-link-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
kendo/
├── app/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   └── members/
│   │   │       ├── upload/         # Excel upload page
│   │   │       └── requests/       # Link request management
│   │   └── family/                 # Parent dashboard
│   │       ├── link/               # Manual link search/request
│   │       └── [childId]/          # Child view
│   └── api/                        # (Optional) if needed, but prefer Server Actions
├── components/
│   ├── admin/
│   │   └── bulk-upload-form.tsx    # Excel upload component
│   ├── family/
│   │   ├── auto-link-modal.tsx     # "Found Child" popup
│   │   └── link-request-form.tsx   # Manual link form
│   └── ui/                         # Shared UI components
├── lib/
│   ├── utils/
│   │   └── excel.ts                # Excel parsing utility
│   └── actions/
│       ├── member-actions.ts       # Server actions for profiles
│       └── link-actions.ts         # Server actions for linking
└── supabase/
    └── migrations/                 # DB schema changes
```

**Structure Decision**: Standard Next.js App Router structure with feature-based colocation where possible.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Bridge Table (`profile_guardians`) | Support multiple guardians (Mom, Dad) | Single `guardian_id` column restricts to one parent |