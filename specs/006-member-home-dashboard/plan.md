# Implementation Plan: Member Home Dashboard & Family Linking

**Branch**: `006-member-home-dashboard` | **Date**: 2026-02-02 | **Spec**: [specs/006-member-home-dashboard/spec.md](spec.md)
**Input**: Feature specification from `specs/006-member-home-dashboard/spec.md`

## Summary

Implement the user home dashboard focusing on "My Progress" and "Family Linking" for parents. This includes creating "Shadow Profiles (가상 프로필)" for children, linking them to Dojos, and a "Family Switcher" to view different profiles' progress. Key goal is to allow guardians to manage multiple children's training and payments from a single account.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.x (App Router)
**Primary Dependencies**: Supabase SDK, Tailwind CSS v4, Lucide React, Radix UI
**Storage**: PostgreSQL 15+ (Supabase)
**Testing**: `npm test` (Jest), Manual Verification
**Target Platform**: Web (Mobile-First)
**Project Type**: Web application (Next.js)
**Performance Goals**: Dashboard data updates within 1 second of profile switch (SC-002)
**Constraints**: Supabase Strict (No standalone backend, use RLS/RPC), Mobile-First UI
**Scale/Scope**: Dashboard UI, Profile Switching Logic, Database Schema for Shadow Profiles

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **Language**: Verified Korean output for UI/Commits.
*   **MVP Mindset**: Features are scoped to P1 (Family Profile Management) and core Dashboard.
*   **Context Awareness**: UI designed for parents/guardians (Family Switcher, Summary).
*   **Tech Stack**: Compliant with Next.js 16, Tailwind v4, Supabase Strict.

## Project Structure

### Documentation (this feature)

```text
specs/006-member-home-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (kendo/)

```text
kendo/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx            # Main dashboard (Guardian Summary OR Member View)
│   │   └── layout.tsx          # Dashboard layout with Family Switcher
├── components/
│   ├── dashboard/
│   │   ├── family-switcher.tsx # Component for switching profiles
│   │   ├── guardian-summary.tsx # Guardian view
│   │   └── progress-card.tsx   # Curriculum progress display
│   └── onboading/              # (Reuse/Extend for linking)
├── lib/
│   ├── types/
│   │   └── family.ts           # Types for family/shadow profiles
│   └── actions/                # Server Actions
│       └── family-actions.ts   # Logic for linking/switching
└── supabase/
    └── migrations/             # Schema changes for owner_id, shadow profiles
```

**Structure Decision**: Next.js App Router with Server Components and Supabase.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |