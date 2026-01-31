# 구현 계획: 사용자 온보딩 및 회원가입

**브랜치**: `002-user-onboarding` | **날짜**: 2026-01-31 | **명세**: [specs/002-user-onboarding/spec.md](./spec.md)
**입력**: `specs/002-user-onboarding/spec.md`의 기능 명세

## 요약 (Summary)

이 기능은 Kendo 도장 관리 시스템의 핵심 온보딩 흐름을 구현합니다. 주요 내용은 다음과 같습니다:
1.  **도장 관장 등록 (Dojo Owner Registration)**: 계정 생성, 새 도장(Tenant) 설정, 관장 프로필 생성.
2.  **관원/사범 가입 신청 (Member/Instructor Signup)**: 도장 검색, 가입 신청(보호자 정보 포함 가능), "승인 대기" 상태 진입.
3.  **승인 워크플로우 (Approval Workflow)**: 관장의 신청 승인(필요 시 Soft Delete된 프로필 복구) 및 관원을 사범으로 승급.
기술적 접근 방식은 **Supabase Auth**로 신원 관리를, **RLS**로 멀티테넌트 보안을, **Next.js**로 위자드 스타일의 UI를 구현합니다.

## 기술적 맥락 (Technical Context)

**언어/버전**: TypeScript 5.x (Next.js 14+)
**주요 의존성**: Supabase CLI (Latest), @supabase/supabase-js, React, Tailwind CSS
**저장소**: PostgreSQL 15+ (via Supabase)
**테스트**: `npm test` (Jest/RTL), `npm run lint`
**타겟 플랫폼**: 웹 (모바일 우선 - Mobile-First)
**프로젝트 유형**: 웹 애플리케이션
**성능 목표**: 빠른 인터랙션 (<200ms)
**제약 사항**: Supabase Strict (커스텀 백엔드 없음), Next.js App Router
**규모/범위**: MVP (사용자당 단일 도장)

## 헌법 준수 확인 (Constitution Check)

*GATE: Phase 0 연구 전 통과 필수. Phase 1 설계 후 재확인.*

- **언어**: 한국어 (산출물/주석) - **준수함 (COMPLIANT)**
- **MVP 마인드셋**: 단순한 흐름, 아바타 제외, 표준 UI - **준수함 (COMPLIANT)**
- **기술 스택**: Next.js 14+, Tailwind, Supabase - **준수함 (COMPLIANT)**
- **맥락 인식**: 관장님/학부모를 위한 모바일 우선 설계 - **준수함 (COMPLIANT)**

## 프로젝트 구조 (Project Structure)

### 문서 (본 기능)

```text
specs/002-user-onboarding/
├── plan.md              # 본 파일
├── research.md          # Phase 0 산출물
├── data-model.md        # Phase 1 산출물
├── quickstart.md        # Phase 1 산출물
├── contracts/           # Phase 1 산출물 (SQL 스키마)
└── tasks.md             # Phase 2 산출물
```

### 소스 코드 (리포지토리 루트)

```text
kendo/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   └── page.tsx
│   ├── onbording/
│   │   ├── create-dojo/
│   │   └── join-dojo/
│   └── api/
│       └── auth/
├── components/
│   ├── ui/
│   └── forms/
├── lib/
│   └── supabase/
└── supabase/
    ├── migrations/
    └── types/
```

**구조 결정**: Supabase 통합을 포함한 표준 Next.js App Router 구조를 따릅니다.

## 복잡도 추적 (Complexity Tracking)

> **헌법 위반 사항이 있어 정당화가 필요한 경우에만 작성**

| 위반 사항 | 필요한 이유 | 거부된 더 단순한 대안 |
|-----------|-------------|-----------------------|
| 해당 없음 | | |
