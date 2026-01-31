# Tasks: 데이터베이스 스키마 및 인증 설정

**Feature**: 001-setup-db-schema
**Status**: Todo
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Phase 1: 설정 (Setup)
*목표: Supabase 프로젝트 구조를 초기화합니다.*

- [x] T001 `kendo/supabase/config.toml`에 Supabase 프로젝트 구조 초기화

## Phase 2: 기반 작업 (Foundational)
*목표: 없음 (핵심 작업은 US1에 포함됨)*

*(이 단계에 해당하는 태스크 없음)*

## Phase 3: User Story 1 - 데이터베이스 스키마 초기화 (P1)
*목표: 모든 필수 데이터베이스 테이블과 스토리지 버킷을 생성합니다.*
*독립 테스트: `supabase migration up`이 성공적으로 실행되고 테이블이 생성되어야 합니다.*

- [x] T002 [US1] 마이그레이션 파일 생성 `kendo/supabase/migrations/20260130000001_init_schema.sql`
- [x] T003 [US1] `dojos` 테이블 정의 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T004 [US1] `profiles` 테이블 정의 및 `phone`, `guardian_phone` 인덱스 추가 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T005 [US1] `signup_requests` 테이블 정의 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T006 [US1] `curriculum_items` 테이블 정의 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T007 [US1] `user_progress` 테이블 정의 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T008 [US1] `attendance_logs` 테이블 정의 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T009 [US1] `payments` 테이블 정의 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T010 [US1] `notices` 테이블 정의 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T011 [US1] `posts` 테이블 정의 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T012 [US1] `comments` 테이블 정의 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)
- [x] T013 [US1] `images` 스토리지 버킷 생성 스크립트 추가 (`kendo/supabase/migrations/20260130000001_init_schema.sql`)

## Phase 4: User Story 2 - 기본 보안 설정 (RLS) (P1)
*목표: 모든 테이블에 Row Level Security 정책을 적용합니다.*
*독립 테스트: 모든 테이블에 RLS가 활성화되어 있고 정책이 적용되었는지 확인합니다.*

- [x] T014 [US2] 마이그레이션 파일 생성 `kendo/supabase/migrations/20260130000002_enable_rls.sql`
- [x] T015 [US2] 10개 전체 테이블에 RLS 활성화 (`kendo/supabase/migrations/20260130000002_enable_rls.sql`)
- [x] T016 [US2] `payments`를 제외한 모든 테이블에 허용적인 MVP 정책(True) 추가 (`kendo/supabase/migrations/20260130000002_enable_rls.sql`)
- [x] T017 [US2] `payments` 테이블에 제한된 정책 추가 (강사 접근 거부) (`kendo/supabase/migrations/20260130000002_enable_rls.sql`)
- [x] T018 [US2] `images` 버킷에 대한 공개 읽기 정책 추가 (`kendo/supabase/migrations/20260130000002_enable_rls.sql`)

## Phase 5: User Story 3 - 데이터 정제 및 자동화 트리거 (P2)
*목표: 데이터 무결성을 위한 정제 로직과 자동화 트리거를 구현합니다.*
*독립 테스트: 하이픈이 포함된 전화번호 입력 시 제거되어 저장되는지, 결제 생성 시 금액이 자동 설정되는지 확인합니다.*

- [x] T019 [US3] 마이그레이션 파일 생성 `kendo/supabase/migrations/20260130000003_add_triggers.sql`
- [x] T020 [US3] 전화번호 정제(하이픈 제거) 함수 및 트리거 생성 (`kendo/supabase/migrations/20260130000003_add_triggers.sql`)
- [x] T021 [US3] `profiles` 및 `signup_requests` 테이블에 전화번호 정제 트리거 적용 (`kendo/supabase/migrations/20260130000003_add_triggers.sql`)
- [x] T022 [US3] 가입 승인 시 프로필 자동 생성 함수 및 트리거 작성 (`kendo/supabase/migrations/20260130000003_add_triggers.sql`)
- [x] T023 [US3] 결제 레코드 생성 시 `dojo.default_fee`를 `amount`로 복사하는 트리거 작성 (`kendo/supabase/migrations/20260130000003_add_triggers.sql`)

## Phase 6: User Story 4 - 초기 데이터 시딩 (P3)
*목표: 테스트를 위한 기본 관리자 계정과 커리큘럼 데이터를 채워넣습니다.*
*독립 테스트: `supabase db reset` 실행 후 `curriculum_items`와 `auth.users`에 데이터가 존재하는지 확인합니다.*

- [x] T024 [US4] `kendo/supabase/seed.sql` 파일 생성
- [x] T025 [US4] `auth.users`에 기본 관리자(Admin) 계정 시딩 SQL 추가 (`kendo/supabase/seed.sql`)
- [x] T026 [US4] `dojos` 테이블에 기본 도장 정보 시딩 SQL 추가 (`kendo/supabase/seed.sql`)
- [x] T027 [US4] `profiles` 테이블에 관리자 프로필 시딩 SQL 추가 (`kendo/supabase/seed.sql`)
- [x] T028 [US4] `curriculum_items` 테이블에 기본 커리큘럼 시딩 SQL 추가 (`kendo/supabase/seed.sql`)

## Phase 7: 마무리 및 검증 (Polish & Verification)
*목표: 데이터베이스 설정의 최종 검증을 수행합니다.*

- [ ] T029 로컬 환경에서 `supabase db reset`을 실행하여 전체 마이그레이션 및 시딩 정상 동작 검증

## 의존성 (Dependencies)

- **US1 (스키마)**: 모든 스토리의 선행 작업입니다. 가장 먼저 완료되어야 합니다.
- **US2 (보안)**: US1의 테이블이 존재해야 합니다.
- **US3 (트리거)**: US1의 테이블이 존재해야 합니다.
- **US4 (시딩)**: US1 테이블과 US3 트리거(프로필 생성 등 데이터 로직에 영향을 줄 경우)가 완료된 후 실행되어야 합니다.

## 구현 전략 (Implementation Strategy)
- US1을 먼저 구현하여 데이터베이스의 뼈대를 구축합니다.
- 로직이 추가되기 전에 US2를 통해 보안을 먼저 확립합니다.
- US3 트리거를 추가하여 초기부터 데이터 무결성을 보장합니다. (특히 결제 금액 자동 설정 등)
- 마지막으로 US4를 통해 프론트엔드 개발 및 테스트가 가능한 환경을 제공합니다.
