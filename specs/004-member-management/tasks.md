# 작업 목록: 관원 관리 (Member Management)

**기능**: 관원 관리 (Member Management)
**상태**: 대기 중 (Pending)
**명세서**: `specs/004-member-management/spec.md`

## Phase 1: 설정 및 데이터베이스 (기반 작업)
**목표**: 데이터베이스 스키마, RPC 함수 초기화 및 프로젝트 구조 설정.
**의존성**: 없음

- [x] T001 `supabase/migrations/20260201000000_member_management_schema.sql`에 `rank_history` 테이블 및 `profiles` 부분 인덱스 생성 마이그레이션 작성
- [x] T002 `supabase/migrations/20260201000000_member_management_schema.sql`에 `update_member_role` 및 `promote_member` RPC 함수 추가
- [x] T003 마이그레이션 적용 및 `lib/types/database.types.ts`에 Supabase 타입 생성
- [x] T004 `lib/types/member.ts`에 Member, RankHistory, SignupRequest 공유 TypeScript 인터페이스 작성
- [x] T005 서버 액션 파일 스캐폴딩 생성: `app/(dashboard)/members/actions.ts`

## Phase 2: 사용자 스토리 1 - 가입 요청 처리 (P1)
**목표**: 관장이 대기 중인 가입 요청을 승인하거나 거절할 수 있도록 함.
**의존성**: Phase 1

- [x] T006-A [US1] `app/(dashboard)/members/actions.ts`에 대기 중인 가입 요청을 조회하는 `getPendingSignupRequests` 서버 액션 구현
- [x] T006 [US1] `app/(dashboard)/members/actions.ts`에 트랜잭션 로직을 포함한 `approveSignup` 서버 액션 구현
- [x] T007 [US1] `app/(dashboard)/members/actions.ts`에 `rejectSignup` 서버 액션 구현
- [x] T008 [US1] `components/dashboard/signup-request-card.tsx`에 `SignupRequestCard` 컴포넌트 생성
- [x] T009 [US1] `components/dashboard/signup-requests-list.tsx`에 `SignupRequestsList` 컴포넌트 구현
- [x] T010 [US1] 대시보드 페이지 `app/(dashboard)/page.tsx`에 `SignupRequestsList` 통합
- [x] T011 [US1] 가입 흐름 검증: 더미 요청 생성 -> 승인 -> `profiles` 테이블 확인

## Phase 3: 사용자 스토리 2 - 관원 검색 및 목록 조회 (P1)
**목표**: 무한 스크롤을 통한 관원 목록 조회 및 검색.
**의존성**: Phase 1

- [x] T012 [US2] `app/(dashboard)/members/actions.ts`에 검색 및 페이지네이션을 지원하는 `getMembers` 서버 액션 구현
- [x] T013 [US2] 목록 뷰를 위한 `MemberCard` 컴포넌트 생성: `components/members/member-card.tsx`
- [x] T014 [US2] `MemberSearch` 컴포넌트(검색 입력창) 생성: `components/members/member-search.tsx`
- [x] T015 [US2] 무한 스크롤 로직을 포함한 `MemberList` 컴포넌트 구현: `components/members/member-list.tsx`
- [x] T016 [US2] 검색과 목록을 결합한 메인 관원 페이지 생성: `app/(dashboard)/members/page.tsx`
- [x] T017 [US2] 검색 검증: 20명 이상의 관원 데이터 생성, 이름/전화번호 검색 및 페이지네이션 테스트

## Phase 4: 사용자 스토리 3 - 사범 권한 관리 (P1)
**목표**: 관장은 관원을 승급/강등할 수 있음 (관장 <-> 사범 <-> 관원).
**의존성**: Phase 3 (관원 목록 UI)

- [x] T018 [US3] `app/(dashboard)/members/actions.ts`에 `changeMemberRole` 서버 액션 구현 (RPC 래핑)
- [x] T019 [US3] `RoleManager` 컴포넌트(드롭다운/모달) 생성: `components/members/role-manager.tsx`
- [x] T020 [US3] `MemberCard`에 `RoleManager` 통합 (관장에게만 조건부 렌더링): `components/members/member-card.tsx`
- [x] T021 [US3] 권한 관리 검증: 관장으로 로그인 -> 관원 승급 -> UI 업데이트 확인

## Phase 5: 사용자 스토리 4 - 관원 상세 정보 조회 (P2)
**목표**: 관원 정보, 승급 이력, 출석 기록 상세 조회.
**의존성**: Phase 3

- [x] T022 [US4] `app/(dashboard)/members/actions.ts`에 `getMemberDetails` 서버 액션 구현 (프로필, 승급 이력, 출석 조회)
- [x] T023 [US4] `app/(dashboard)/members/actions.ts`에 `promoteMember` 서버 액션 구현 (RPC 래핑)
- [x] T024 [US4] `RankHistoryList` 컴포넌트 생성: `components/members/rank-history-list.tsx`
- [x] T024-A [US4] 급수 선택 로직이 포함된 `RankPromotionModal` 컴포넌트 생성: `components/members/rank-promotion-modal.tsx`
- [x] T024-B [US4] `app/(dashboard)/members/actions.ts`에 페이지네이션을 지원하는 `getAttendanceHistory` 서버 액션 구현
- [x] T024-C [US4] '더보기' 페이지네이션이 포함된 `AttendanceHistoryList` 컴포넌트 구현: `components/members/attendance-history-list.tsx`
- [x] T025 [US4] `MemberDetailView` 컴포넌트 생성: `components/members/member-detail-view.tsx`
- [x] T026 [US4] 관원 상세 페이지 구현: `app/(dashboard)/members/[id]/page.tsx`
- [x] T027 [US4] 상세 뷰 검증: 목록에서 관원 클릭 -> 모든 데이터 필드 로드 확인

## Phase 6: 사용자 스토리 5 - 관원 삭제 (P2)
**목표**: 관원 Soft Delete 처리.
**의존성**: Phase 5

- [x] T028 [US5] `app/(dashboard)/members/actions.ts`에 `softDeleteMember` 서버 액션 구현
- [x] T029 [US5] `components/members/member-detail-view.tsx`에 확인 다이얼로그가 포함된 `DeleteMemberButton` 추가
- [x] T030 [US5] 삭제 검증: 관원 삭제 -> 목록에서 사라짐 확인 (DB에는 존재)

## Phase 7: 마무리 및 공통 작업 (Polish & Cross-Cutting)
**목표**: UX 개선 및 최종 보안 점검.
**의존성**: 모든 스토리

- [x] T031 "관원 관리" 링크 추가 (없는 경우): `app/(dashboard)/layout.tsx` (인라인 사이드바 수정)
- [x] T032 `components/members/edit-member-form.tsx`에 관장용 관원 정보 수정 폼(이름/전화번호) 생성
- [x] T032-A [US4] `app/(dashboard)/members/actions.ts`에 변경 사항을 저장하는 `updateMemberDetails` 서버 액션 구현
- [x] T033 [US4] 상세 페이지 `app/(dashboard)/members/[id]/page.tsx`에 `EditMemberForm` 통합
- [x] T034 관원 관리 전체 흐름에 대한 E2E 테스트(수동 또는 자동) 수행

## 구현 전략 (Implementation Strategy)
- **MVP**: Phase 1 & 2 (가입 처리) + Phase 3 (목록) 완료 시 기본 운영 가능.
- **점진적 배포**: 역할 관리, 상세 정보/삭제 기능은 순차적으로 배포.
- **병렬화**: 
  - US2 (목록)와 US3 (역할)는 UI 컴포넌트가 합의되면 병렬 개발 가능.
  - 백엔드 액션(T006, T012, T018, T022)은 프론트엔드와 병렬 구현 가능.