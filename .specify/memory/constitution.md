<!--
Sync Impact Report:
- Version change: 1.0.0 -> 2.0.0
- List of modified principles: Complete rewrite. Replaced old principles with new directives (Language, MVP, Tech Stack, etc.).
- Added sections: Language & Communication, MVP Mindset, Tech Stack Constraints, Code Style, Context Awareness.
- Removed sections: 1-Second Management, Parent-Centric Growth, Strict Data Sanitization, etc.
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ checked - generic)
  - .specify/templates/spec-template.md (✅ checked - generic)
  - .specify/templates/tasks-template.md (✅ checked - generic)
- Follow-up TODOs: None
-->

# Kendo Project Constitution

## Core Principles

### I. Language & Communication (Prime Directive)
* **모든 답변과 산출물은 반드시 '한국어(Korean)'로 작성한다.**
* **대화:** 앱 UI와 커밋 메시지는 한국어로 하되 기획서는 영어를 허용한다
* **변수명/함수명:** 영문(English)을 사용하되, 의미가 명확한 `camelCase`를 준수한다. (예: `userList` (O), `gwanwonList` (X), `list` (X))
* **커밋 메시지:** 한국어로 작성한다. (예: `feat: 출석 체크 기능 추가`)

### II. MVP Mindset (Development Philosophy)
* **YAGNI (You Aren't Gonna Need It) 원칙 준수:** PRD에 명시되지 않은 기능(화려한 애니메이션, 복잡한 결제 등)은 절대 먼저 제안하거나 구현하지 않는다.
* **추상화 금지:** "나중에 필요할 수 있으니 추상화하자"는 생각은 버리고, 지금 당장 작동하는 가장 직관적인 코드를 작성한다.
* **완벽보다 속도 (Speed over Perfection):** 복잡한 디자인 패턴보다 읽기 쉽고 수정하기 쉬운 코드를 선호한다.
* **에러 처리:** 치명적인 오류(앱 크래시)만 방지하고, 사용자에게는 `alert`나 `toast`로 간단히 처리한다.

### III. Context Awareness (Domain Understanding)
* **Target Audience:** IT에 익숙하지 않은 **중장년층(관장님)**과 **학부모**가 주 사용자임을 인지한다.
* **UI/UX Standard:** 글씨는 큼직해야 하며, 터치 영역(Button)은 충분히 넓어야 한다 (최소 44px).

## Additional Constraints

- **Tech Stack (Strict):**
  - **Next.js 15+ (App Router) Only**: `Pages Router` 사용 금지. (React 19 & Tailwind v4 기반)
  - **Tailwind CSS v4 Only**: `styled-components` 등 별도 CSS 파일 생성 금지.
  - **Supabase Strict**: 별도 Node.js 서버 없이 Supabase SDK/RPC/RLS로만 백엔드 로직 해결.
- **Component Strategy**: 기본적으로 **Server Component**로 간주하며, `useState` 등 필요 시에만 `'use client'` 사용.
- **Styling Strategy**: 반응형은 **Mobile-First** (모바일 `default` -> 데스크탑 `md:`, `lg:` 확장).
- **Code Quality**:
  - **TypeScript Strict Mode**: `any` 사용 지양, Interface 정의 필수.
  - **Explicit Naming**: 관장님(`Owner`), 사범님(`Instructor`), 관원(`Member`/`Student`), 보호자(`Guardian`), 도장(`Dojo`) 등 도메인 용어 통일.
- **Error Handling**: Supabase 요청 실패 시 콘솔 로그 대신 UI 피드백(Toast) 제공 필수.

## Governance

- This constitution supersedes all other project practices and documentation.
- All technical specifications and plans must be validated against these principles.
- Amendments require a version bump and an update to the Sync Impact Report.

**Version**: 2.0.0 | **Ratified**: 2026-01-30 | **Last Amended**: 2026-01-30