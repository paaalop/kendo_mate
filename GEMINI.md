# kendo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-30

## Active Technologies
- TypeScript 5.x (Next.js 14+) + Supabase CLI (Latest), @supabase/supabase-js, React, Tailwind CSS (002-user-onboarding)
- PostgreSQL 15+ (via Supabase) (002-user-onboarding)
- TypeScript 5.x, Next.js 14+ (App Router) + Supabase SDK, Tailwind CSS, Lucide React, Radix UI (003-training-management)
- PostgreSQL (via Supabase) (003-training-management)
- TypeScript 5.x + Next.js 16.x, React 19.x, Supabase JS, Tailwind CSS v4, Lucide React (004-member-management)
- Supabase (PostgreSQL 15+) (004-member-management)
- TypeScript 5.x, Next.js 16.x (App Router) + Supabase (Auth, DB, Realtime), Tailwind CSS v4, Lucide React (005-owner-admin-features)
- PostgreSQL 15+ (Supabase) (005-owner-admin-features)
- TypeScript 5.x, Next.js 16.1.6 (React 19) + Tailwind CSS v4, Supabase JS, Lucide React, Radix UI, React Hook Form, Zod (006-member-home-dashboard)
- TypeScript 5.x, Next.js 16.x (App Router) + Supabase SDK, Tailwind CSS v4, Lucide React, Radix UI (006-member-home-dashboard)
- TypeScript 5.x + Next.js 16+ (App Router), Supabase JS SDK, Lucide React, Tailwind CSS v4, React Hook Form + Zod (007-community-features)
- Supabase Storage (Bucket: `community-images`) (007-community-features)
- TypeScript 5.x + Next.js 16.1.6 (App Router), Supabase JS, Tailwind CSS v4, Lucide React, Radix UI, React Hook Form, Zod, xlsx (New) (008-member-link-system)

- SQL (PostgreSQL 15+), TypeScript 5.x (Next.js 14+) + Supabase CLI (Latest), @supabase/supabase-js (001-setup-db-schema)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

SQL (PostgreSQL 15+), TypeScript 5.x (Next.js 14+): Follow standard conventions

## Recent Changes
- 008-member-link-system: Added TypeScript 5.x + Next.js 16.1.6 (App Router), Supabase JS, Tailwind CSS v4, Lucide React, Radix UI, React Hook Form, Zod, xlsx (New)
- 007-community-features: Added TypeScript 5.x + Next.js 16+ (App Router), Supabase JS SDK, Lucide React, Tailwind CSS v4, React Hook Form + Zod
- 006-member-home-dashboard: Added TypeScript 5.x, Next.js 16.x (App Router) + Supabase SDK, Tailwind CSS v4, Lucide React, Radix UI


<!-- MANUAL ADDITIONS START -->

## 🚀 Next.js 16 & Proxy Pattern 개발 규칙 (2026 기준)

1. **Proxy Pattern 사용**: 
   - `middleware.ts` 대신 `proxy.ts`를 인증 및 라우팅의 메인 진입점으로 사용합니다.
   - 모든 글로벌 요청 처리는 `proxy.ts` 내의 `export async function proxy(request: NextRequest)`에서 수행합니다.

2. **헤더 기반 인증 전파 (Header Injection)**:
   - `proxy.ts`에서 인증된 사용자 ID를 `x-user-id` 헤더에 주입하여 하위 서버 컴포넌트로 전달합니다.
   - 서버 컴포넌트 및 데이터 페칭 유틸리티에서는 `headers()`를 통해 이 값을 우선 확인하여 Supabase Auth의 중복 API 호출을 방지합니다.

3. **데이터 페칭 최적화 (Waterfall 방지)**:
   - **중복 쿼리 금지**: Layout에서 이미 가져온 데이터(프로필 등)는 Page에서 다시 DB 요청을 보내지 않고 Context나 Props를 통해 재사용합니다.
   - **병렬 처리**: 서로 의존성이 없는 데이터 요청은 반드시 `Promise.all`을 사용하여 병렬로 실행합니다.

4. **Vercel 배포 성능 최적화**:
   - 서버리스 환경의 네트워크 레이턴시를 최소화하기 위해, 순차적인 `await` 호출을 지양하고 가급적 단일 쿼리나 RPC를 활용합니다.

5. **배포 안정성 및 빌드 에러 방지 (Vercel)**:
   - **사전 빌드 검증**: 모든 코드는 푸시 전 로컬에서 `npm run build`를 실행하여 TypeScript 오류가 없는지 반드시 확인합니다.
   - **엄격한 타입 준수**: Supabase Table Row 데이터 조작 시 `database.types.ts`의 정의를 엄격히 따르며, 필수 필드(특히 `updated_at`, `id` 등) 누락을 방지합니다.
   - **동적 속성명 지양**: DB Insert/Update 시 TypeScript의 타입 추론을 위해 가급적 동적 속성명(`[key]: value`) 대신 명시적 속성명을 사용합니다.

<!-- MANUAL ADDITIONS END -->
