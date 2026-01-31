# 구현 계획: 관원 관리 (Member Management)

**브랜치**: `004-member-management` | **작성일**: 2026-02-01 | **명세서**: `specs/004-member-management/spec.md`
**입력**: `specs/004-member-management/spec.md`의 기능 명세

**참고**: 이 템플릿은 `/speckit.plan` 명령에 의해 작성되었습니다. 실행 워크플로우는 `.specify/templates/commands/plan.md`를 참조하세요.

## 요약 (Summary)

관원 관리 기능을 구현합니다. 목록 조회(무한 스크롤), 검색, 상세 정보 보기, 역할 관리(관장/사범), Soft Delete 기능을 포함합니다. Supabase RLS와 Server Actions를 사용하여 구현합니다.

## 기술적 맥락 (Technical Context)

**언어/버전**: TypeScript 5.x
**주요 의존성**: Next.js 16.x, React 19.x, Supabase JS, Tailwind CSS v4, Lucide React
**저장소**: Supabase (PostgreSQL 15+)
**테스트**: Jest + React Testing Library (유닛), Playwright (E2E)
**타겟 플랫폼**: Web (모바일 우선, 반응형)
**프로젝트 유형**: Web application (Next.js App Router)
**성능 목표**: 1000건 데이터 검색 시 1초 미만
**제약 사항**: Supabase Free Tier 제한, 모바일 뷰포트 최적화
**규모/범위**: 약 1000명의 관원, 무한 스크롤 목록

## 헌법 준수 확인 (Constitution Check)

*GATE: Phase 0 연구 전 필수 확인. Phase 1 설계 후 재확인.*

- **언어 및 커뮤니케이션**: ✅ 모든 출력물과 커밋 메시지는 한국어를 사용합니다.
- **MVP 마인드셋**: ✅ YAGNI 적용 (단순 목록, Soft Delete). 불필요한 기능 배제.
- **기술 스택**: ✅ Next.js App Router, Tailwind, Supabase SDK 준수.
- **코드 스타일**: ✅ 함수형 컴포넌트, Strict TypeScript 사용.
- **맥락 인지**: ✅ 중장년층 사용자를 위한 모바일 우선 디자인 (큰 폰트/버튼).
- **테스트**: ✅ 누락된 테스트 인프라 설정 계획 포함.

## 프로젝트 구조 (Project Structure)

### 문서 (본 기능)

```text
specs/004-member-management/
├── plan.md              # 본 파일 (구현 계획)
├── research.md          # Phase 0 산출물 (연구)
├── data-model.md        # Phase 1 산출물 (데이터 모델)
├── quickstart.md        # Phase 1 산출물 (퀵스타트)
├── contracts/           # Phase 1 산출물 (API 계약)
└── tasks.md             # Phase 2 산출물 (작업 목록)
```

### 소스 코드 (레포지토리 루트)

```text
kendo/
├── app/
│   ├── (dashboard)/
│   │   └── members/
│   │       ├── page.tsx          # 목록 뷰 (Server + Client)
│   │       ├── actions.ts        # Server Actions
│   │       └── [id]/
│   │           └── page.tsx      # 상세 뷰
│   └── api/                      # (최소화/미사용 - Actions 권장)
├── components/
│   └── members/
│       ├── member-list.tsx       # 클라이언트 컴포넌트 (무한 스크롤)
│       ├── member-card.tsx
│       ├── role-manager.tsx
│       └── member-search.tsx
├── lib/
│   └── utils/                    # 공통 헬퍼
├── supabase/
│   └── migrations/               # 스키마 변경
└── __tests__/                    # 유닛 테스트
```

**구조 결정**: 기능 단위로 `app/` 내부에 배치를 원칙으로 하는 표준 Next.js App Router 구조를 따릅니다.

## 복잡성 추적 (Complexity Tracking)

> **헌법 위반 사항이 있을 경우에만 작성하여 정당성을 부여합니다.**

| 위반 사항 | 필요한 이유 | 거절된 더 단순한 대안 | 대안 거절 사유 |
|-----------|-------------|-----------------------|----------------|
| (없음)    |             |                       |                |