# 할 일 목록 (Tasks): 사용자 온보딩 및 회원가입

## Phase 1: 환경 설정 (Setup)
- [x] T001 마이그레이션 파일 `kendo/supabase/migrations/20260131000000_user_onboarding.sql` 생성. `specs/002-user-onboarding/contracts/schema.sql` 내용을 바탕으로 하며, 도장 종속 테이블들에 ON DELETE CASCADE 설정(FR-020) 및 도장 이름 대소문자 구분 없는 Unique 인덱스(FR-014) 적용 확인
- [x] T002 온보딩 흐름에 대한 경로 보호 및 리다이렉션 로직(미인증 -> 로그인, 인증됨+도장 없음 -> 온보딩)을 처리하도록 `kendo/middleware.ts` 업데이트

## Phase 2: 기반 구축 (Foundational)
- [x] T003 `supabase db reset`(또는 데이터 보존 시 `migration up`)을 사용하여 로컬 Supabase 마이그레이션 적용 및 스키마 업데이트
- [x] T004 [P] Supabase 스키마로부터 TypeScript 타입 생성 및 `kendo/lib/types/database.types.ts`에 저장
- [x] T005 [P] 전화번호 포맷팅 및 유효성 검사 유틸리티 `formatPhoneNumber` 구현 (DB용 하이픈 제거, UI용 하이픈 추가). 한국 휴대폰 번호 형식(010 시작, 11자리) 검증 로직 포함 (`kendo/lib/utils/phone.ts`)
- [x] T006 [P] 온보딩용 공유 Zod 스키마(도장 생성, 관원 가입) 생성. 비밀번호 정책(8자 이상, 영문+숫자 혼용 필수, 특수문자 선택) 포함 (FR-016) (`kendo/lib/validations/onboarding.ts`)

## Phase 2.5: 인증 인프라 (Authentication Infrastructure)
- [x] T007 [Auth] 로그인/회원가입 페이지의 일관된 스타일링을 위한 `AuthLayout` 구현 (`kendo/app/(auth)/layout.tsx`)
- [x] T008 [Auth] T006의 Zod 스키마를 사용하는 `LoginForm` 및 `SignupForm` 컴포넌트 구현 (`kendo/components/auth/`)
- [x] T009 [Auth] 로그인 페이지 구현 (`kendo/app/(auth)/login/page.tsx`)
- [x] T010 [Auth] 일반 회원가입 페이지 구현 (인증 계정만 생성 후 온보딩 선택 페이지로 리다이렉트) (`kendo/app/(auth)/signup/page.tsx`)

## Phase 3: 사용자 시나리오 1 - 관장 등록 및 도장 설정
**목표**: 신규 사용자가 도장을 생성하고 관장이 될 수 있도록 함.
**독립 테스트**: 신규 사용자로 가입 -> "도장 생성" 폼 작성 -> 대시보드 리다이렉션 및 DB(dojos, profiles) 레코드 확인.

- [x] T011 [US1] `dojos` 테이블 삽입 및 초기 프로필 생성을 처리하는 Server Action `createDojo` 구현. 생성 전 기존 가입 신청(pending) 자동 삭제(FR-002) 및 이미 프로필이 존재하는지 체크(1인 1도장 정책, FR-011) 로직 포함 (`kendo/app/onboarding/actions.ts`)
- [x] T012 [US1] `react-hook-form`과 유효성 검사 스키마를 사용하는 `CreateDojoForm` 컴포넌트 구현 (`kendo/components/onboarding/create-dojo-form.tsx`)
- [x] T013 [US1] 폼 컴포넌트를 활용한 관장 온보딩 페이지 구현 (`kendo/app/onboarding/create-dojo/page.tsx`)
- [x] T014 [US1] 생성 후 랜딩 페이지 역할을 할 기본 대시보드 레이아웃 및 페이지 구현 (`kendo/app/(dashboard)/layout.tsx`, `kendo/app/(dashboard)/page.tsx`)

## Phase 4: 사용자 시나리오 2 - 관원/사범 가입 신청
**목표**: 사용자가 도장을 검색하고 가입 신청을 제출할 수 있도록 함.
**독립 테스트**: 다른 사용자로 로그인 -> 도장 검색 -> 신청서 제출(보호자 정보 포함/미포함) -> "대기 중" 화면 및 DB 레코드 확인.

- [x] T015 [US2] 도장 검색(이름 부분 일치)을 위한 Server Action `searchDojos` 구현 (`kendo/app/onboarding/actions.ts`)
- [x] T016 [US2] 전화번호 정제, 중복 체크, 기존 소속 도장 여부(FR-011/FR-021) 확인을 포함한 가입 신청 제출 Server Action `submitSignupRequest` 구현 (`kendo/app/onboarding/actions.ts`)
- [x] T017 [US2] 도장 이름과 관장 이름을 표시하는 `DojoSearch` 컴포넌트 구현 (`kendo/components/onboarding/dojo-search.tsx`)
- [x] T018 [US2] 가입 신청 폼 `JoinDojoForm` 컴포넌트 구현 (필드: 이름, 전화번호, 성인 여부, 보호자 전화번호) (`kendo/components/onboarding/join-dojo-form.tsx`)
- [x] T019 [US2] 도장 검색 페이지 구현 (`kendo/app/onboarding/join-dojo/page.tsx`)
- [x] T020 [US2] 가입 신청서 작성 페이지 구현 (`kendo/app/onboarding/join-dojo/[dojoId]/page.tsx`)
- [x] T021 [US2] "승인 대기 중" 상태 페이지 구현. Supabase Realtime을 사용하여 `profiles` 테이블 변화 감지 및 승인 시 자동 리다이렉트 처리 (FR-017) (`kendo/app/onboarding/status/page.tsx`)
- [x] T021-1 [US2] **사용자 본인의 대기 중인 신청을 취소**하는 Server Action `cancelSignupRequest` 구현 및 대기 화면 내 '신청 취소' 버튼 추가 (FR-012)

## Phase 5: 사용자 시나리오 3 - 사범 승급 및 승인 관리
**목표**: 관장이 신청을 승인하고 관원을 사범으로 승급시킬 수 있도록 함.
**독립 테스트**: 관장으로 로그인 -> 대기 중인 신청 승인 -> 해당 관원을 사범으로 승급 -> `profiles` 테이블 업데이트 확인.

- [x] T022 [US3] 신청 승인(`approveRequest`), 거절(`rejectRequest`), 역할 변경(`updateMemberRole`)을 위한 Server Action 구현 (`kendo/app/(dashboard)/members/actions.ts`)
- [x] T023 [US3] 대기 중인 신청 목록을 표시하는 `SignupRequestsList` 컴포넌트 구현 (FIFO 정렬) (`kendo/components/dashboard/signup-requests-list.tsx`)
- [x] T024 [US3] 역할 관리 컨트롤을 포함한 `MembersList` 컴포넌트 구현 (`kendo/components/dashboard/members-list.tsx`)
- [x] T025 [US3] 두 목록을 통합하고 클라이언트 측 실시간 검색 필터(이름, 전화번호, 보호자 번호)를 적용한 관원 관리 페이지 구현 (FR-018) (`kendo/app/(dashboard)/members/page.tsx`)

## Phase 6: 다듬기 (Polish)
- [x] T026 [P] `dojos`, `profiles`, `signup_requests`에 대한 엄격한 RLS 정책 구현 또는 확인 (`kendo/supabase/migrations/20260131000001_update_rls.sql`)
- [x] T027 [P] 온보딩 위자드 스타일링 다듬기. 프로젝트 헌법 III(터치 영역 44px 이상, 큰 글씨) 준수 확인 및 단계 표시/모바일 반응성 적용 (`kendo/app/onboarding/layout.tsx`)
- [x] T028 UI 폼에 도장 이름 중복 및 전화번호 유효성 검사 에러 핸들링 추가
- [x] T029 [P] 관장 탈퇴 시 Cascade Hard Delete(도장, 프로필, 신청 내역 삭제)를 처리하는 `deleteAccount` Server Action 구현 (FR-020)
- [x] T030 외부 알림(이메일/SMS) 발송 로직이 없음을 최종 확인하고, 관장 대시보드에서만 신청 확인이 가능함을 검증 (FR-013)

## 의존성 (Dependencies)
- **Phase 1 & 2**는 모든 사용자 시나리오의 선행 조건입니다.
- **Phase 3 (관장)**와 **Phase 4 (관원)**는 Phase 2 이후 병렬 개발이 가능하나, Phase 4의 수동 테스트를 위해 최소 하나 이상의 도장이 생성되어 있어야 합니다.
- **Phase 5 (승인)**는 Phase 3(관장 존재)과 Phase 4(신청 내역 존재)에 의존합니다.

## 구현 전략 (Implementation Strategy)
- **MVP 범위**: 해피 패스(도장 생성 -> 가입 신청 -> 승인)에 우선 집중합니다.
- **테스트**: 각 시나리오별 "독립 테스트" 기준을 활용하여 수동 검증을 수행합니다.