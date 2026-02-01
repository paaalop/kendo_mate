# Implementation Plan: Owner Admin Features

**Branch**: `005-owner-admin-features` | **Date**: 2026-02-01 | **Spec**: [specs/005-owner-admin-features/spec.md](./spec.md)
**Input**: Feature specification from `spec.md`

## Summary

Implement core administrative features for Dojo Owners:
1.  **Payment Management**: Monthly fee tracking with auto-generation (via `pg_cron` or manual trigger), status filtering, and toggling.
2.  **Dojo Configuration**: Update Dojo profile and manage fixed training `sessions`.
3.  **Curriculum Management**: Create and strictly reorder training curriculum items.
4.  **Role Security**: Enforce strict access control (RLS & UI) so only Owners can access these features.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 15.x (App Router)
**Primary Dependencies**: Supabase (Auth, DB, Realtime), Tailwind CSS v4, Lucide React
**Storage**: PostgreSQL 15+ (Supabase)
**Testing**: Manual verification + E2E (Playwright - optional/future)
**Target Platform**: Web (Mobile-First)
**Project Type**: Next.js Web Application
**Performance Goals**: < 1s load time for payment lists
**Constraints**: Supabase-only backend (no custom Node server), Strict Role Isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

-   **Language**: Korean for UI/Commits. (Compliant)
-   **MVP Mindset**: "Auto-generate" via simple DB function/cron, no complex billing system. (Compliant)
-   **Tech Stack**: Next.js App Router, Supabase, Tailwind. (Compliant)
-   **Role Isolation**: RLS policies explicitly defined. (Compliant)

## Project Structure

### Documentation (this feature)

```text
specs/005-owner-admin-features/
├── plan.md              # This file
├── research.md          # Design decisions (Cron vs Manual, Reordering)
├── data-model.md        # DB Schema & RLS
├── quickstart.md        # Testing guide
├── contracts/           # Server Actions definitions
│   └── actions.md
└── tasks.md             # To be generated
```

### Source Code (repository root)

```text
kendo/
├── app/
│   ├── (dashboard)/
│   │   ├── payments/          # New Page
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── settings/          # New Page
│   │       ├── page.tsx
│   │       ├── layout.tsx     # Tabs (Dojo, Curriculum)
│   │       └── actions.ts
├── components/
│   ├── payments/              # New Components
│   │   ├── payment-list.tsx
│   │   └── status-badge.tsx
│   └── settings/              # New Components
│       ├── session-manager.tsx
│       └── curriculum-list.tsx
├── supabase/
│   └── migrations/            # New migrations for payments, sessions, etc.
└── lib/types/
    └── admin.ts               # New types
```

**Structure Decision**: Follows existing Next.js App Router patterns. New features grouped by domain (`payments`, `settings`) in `app` directory.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (None) | | |