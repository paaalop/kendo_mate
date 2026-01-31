# Implementation Plan: Training Management

**Branch**: `003-training-management` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification for training management, including attendance, progress tracking, and promotion notifications.

## Summary

구현할 기능은 관장님과 사범님이 관원들의 출석과 수련 진도를 효율적으로 관리할 수 있는 '수련 관리' 기능입니다. 주요 기능으로는 시간표별 관원 조회, 원터치 출석 체크(Optimistic UI), 진도 심사(Pass), 미납 상태 확인, 그리고 승급 심사 알림 전송이 포함됩니다. Supabase를 활용하여 실시간 데이터 연동 및 권한 제어를 수행하며, IT에 익숙하지 않은 사용자를 배려한 큰 UI와 직관적인 인터랙션을 제공합니다.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 14+ (App Router)
**Primary Dependencies**: Supabase SDK, Tailwind CSS, Lucide React, Radix UI
**Storage**: PostgreSQL (via Supabase)
**Testing**: Playwright (E2E), Vitest (Unit)
**Target Platform**: Web (Mobile-First responsive)
**Project Type**: Web application (`kendo/` directory)
**Performance Goals**: Attendance toggle < 100ms (Optimistic UI)
**Constraints**: 44px+ touch targets, large text (Min 16px/1rem).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **한국어 사용**: ✅ 모든 UI 및 문서 한국어 작성.
2. **MVP Mindset**: ✅ 필수 기능(출석, 진도, 알림)에 집중.
3. **Tech Stack**: ✅ Next.js 14, Tailwind, Supabase 사용.
4. **UI/UX Standard**: ✅ 큰 글씨, 큰 버튼(44px) 준수.
5. **Mobile-First**: ✅ 모바일 대응 UI 설계.

## Project Structure

### Documentation (this feature)

```text
specs/003-training-management/
├── plan.md              # 이 파일
├── research.md          # 조사 결과 (시간표 형식, 쿼리 로직)
├── data-model.md        # 데이터 관계도
├── quickstart.md        # 개발 시작 가이드
├── contracts/           # API 명세
│   └── training-api.md
└── tasks.md             # (추후 생성) 작업 목록
```

### Source Code (repository root)

```text
kendo/
├── app/
│   └── (dashboard)/
│       └── training/
│           ├── page.tsx      # 수련 관리 메인 페이지
│           └── actions.ts     # 서버 액션 (출석, 진도 통과)
├── components/
│   └── training/
│       ├── training-container.tsx
│       ├── member-card.tsx
│       └── promotion-manager.tsx
└── lib/
    └── validations/
        └── training.ts       # 유효성 검사 (심사 월 등)
```

**Structure Decision**: `kendo/` 디렉토리 내 Next.js App Router 구조를 따르며, `components/training/`에 전용 컴포넌트를 격리하여 관리합니다.


## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
