# Implementation Plan: Setup Database Schema and Auth

**Branch**: `001-setup-db-schema` | **Date**: 2026-01-30 | **Spec**: [specs/001-setup-db-schema/spec.md](../001-setup-db-schema/spec.md)
**Input**: Feature specification from `/specs/001-setup-db-schema/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

이 기능은 검도장 관리 서비스(Kendo)의 핵심 데이터 구조를 구축하는 작업입니다.
**Supabase CLI**를 사용하여 10개의 핵심 테이블(`dojos`, `profiles`, `payments` 등)을 생성하고, 보안을 위한 **RLS(Row Level Security)** 정책을 적용합니다.
또한, 데이터 무결성을 위한 **PostgreSQL Trigger**(전화번호 정제, 프로필 자동 생성)와 초기 테스트를 위한 **Seed Data**를 구성합니다.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: SQL (PostgreSQL 15+), TypeScript 5.x (Next.js 14+)  
**Primary Dependencies**: Supabase CLI (Latest), @supabase/supabase-js  
**Storage**: PostgreSQL (Supabase)  
**Testing**: Manual Verification via SQL Scripts / Supabase Local Studio  
**Target Platform**: Web (Next.js), Supabase (Backend)  
**Project Type**: Web application + Backend-as-a-Service  
**Performance Goals**: N/A (Schema Setup)  
**Constraints**: Supabase Free Tier limits (Storage, Database size)  
**Scale/Scope**: 10 Tables, RLS Policies, Triggers  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **Language & Communication**: 모든 문서와 커밋 메시지는 한국어로 작성합니다. (✅ 준수)
*   **MVP Mindset**: PRD에 명시된 10개 테이블과 필수 RLS만 구현합니다. (✅ 준수)
*   **Tech Stack (Strict)**:
    *   **Supabase Strict**: 별도 백엔드 없이 Supabase 기능(DB, Auth, Storage)만 사용합니다. (✅ 준수)
    *   **Tailwind CSS**: (본 작업은 DB 작업이므로 해당 없음, 추후 UI 작업 시 준수)
    *   **Next.js 14+**: (본 작업은 DB 작업이므로 해당 없음)
*   **Context Awareness**: 관장님과 학부모를 위한 데이터 구조(보호자 정보, 직관적인 Role)를 반영합니다. (✅ 준수)

## Project Structure

### Documentation (this feature)

```text
specs/001-setup-db-schema/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Schema definitions)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
kendo/
├── supabase/
│   ├── config.toml      # Supabase Local Config
│   ├── migrations/      # SQL Migrations (YYYYMMDDHHMMSS_name.sql)
│   ├── seed.sql         # Initial Data (Admin, Curriculum)
│   └── tests/           # (Optional) Database Tests
└── app/                 # Next.js App (No changes in this feature)
```

**Structure Decision**: `kendo/` 디렉토리 내에 `supabase` 폴더를 생성하여 관리합니다. 이는 Next.js 프로젝트와 함께 모노레포 형태로 관리하기 위함입니다.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
