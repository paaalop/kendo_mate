# Tasks: Member Home Dashboard & Family Linking

**Feature**: `006-member-home-dashboard`
**Status**: Completed
**Total Tasks**: 29
**User Stories**: 2

## Phase 1: Setup (데이터베이스 및 인프라)
- [x] T001 [DB] `supabase/migrations`에 `members` 테이블 수정(owner_id, is_shadow 추가) 및 `link_requests` 테이블 생성 SQL 작성
- [x] T002 [DB] 보호자 요약 정보를 위한 `get_guardian_summary` RPC 함수 작성
- [x] T003 [DB] 다음 커리큘럼 항목 조회를 위한 `get_next_curriculum` RPC 함수 작성
- [x] T004 [Type] `lib/types/family.ts`에 가상 프로필 및 연결 요청 관련 타입 정의
- [x] T005 [RLS] `members` 및 `link_requests` 테이블에 대한 RLS 정책 적용 (보호자 조회/수정 권한)

## Phase 2: Guardian - 가상 프로필 관리 (US2)
- [x] T006 [Action] `lib/actions/family-actions.ts`에 가상 프로필 생성(`createShadowProfile`) 서버 액션 구현 (FR-001)
- [x] T007 [UI] `components/onboarding/create-profile-form.tsx` 구현 (자녀 이름, 생년월일 입력)
- [x] T008 [Page] `app/(dashboard)/family/create/page.tsx` 페이지 생성 및 폼 연동

## Phase 3: Guardian - 도장 연결 요청 (US2)
- [x] T009 [Action] `lib/actions/family-actions.ts`에 도장 연결 요청(`createLinkRequest`) 서버 액션 구현 (FR-002)
- [x] T010 [UI] `components/onboarding/dojo-search.tsx`를 재사용하여 연결할 도장 검색 및 선택 UI 구현
- [x] T011 [Action] `lib/actions/family-actions.ts`에 연결 해제 요청(`requestUnlink`) 서버액션 구현 (FR-008)
- [x] T012 [UI] 프로필 설정 화면에 '도장 연결 해제' 버튼 및 확인 모달 추가

## Phase 4: Guardian - 패밀리 스위처 및 요약 화면 (US2)
- [x] T013 [UI] `components/dashboard/family-switcher.tsx` 컴포넌트 구현 (내비게이션 바/헤더에 위치) (FR-003)
- [x] T014 [State] 패밀리 스위처 선택 시 대시보드 컨텍스트(쿠키 또는 URL 파라미터) 전환 로직 구현 (FR-004)
- [x] T015 [UI] `components/dashboard/guardian-summary.tsx` 구현 (자녀별 출석/미납 요약 카드 리스트) (FR-005)
- [x] T016 [Page] `app/(dashboard)/page.tsx`를 수정하여 '보호자 모드'일 때 요약 화면 렌더링 분기 처리

## Phase 5: Member - 대시보드 상세 (US1)
- [x] T017 [Logic] `lib/utils/curriculum.ts`에 `getCurrentCurriculumItem` 유틸리티 함수 구현 (FR-007)
- [x] T018 [UI] `components/dashboard/progress-card.tsx` 구현 (다음 배울 기술 및 진도율 표시) (FR-006)
- [x] T019 [Page] `app/(dashboard)/page.tsx`에서 관원 모드일 때 진도 카드 및 출석 현황 표시 연동
- [x] T020 [UI] 대시보드 상단 타이틀을 "{이름}님의 진도"로 동적 변경 (SC-004)

## Phase 6: Admin - 연결 요청 관리 (Admin)
- [x] T021 [Action] `lib/actions/admin-actions.ts`에 `handleLinkRequest` 구현 (승인-병합, 승인-승격, 거절)
- [x] T022 [UI] `components/admin/link-request-card.tsx` 구현 ('병합' vs '승격' 선택 옵션 포함)
- [x] T023 [Page] `app/(dashboard)/admin/links/page.tsx` 생성 및 대기 중인 요청 목록 표시
- [x] T024 [Action] `handleUnlinkRequest` 액션 구현 및 관리자 승인 UI 추가 (FR-008)

## Phase 7: Polish & Quality
- [x] T025 [UI] `components/dashboard/dashboard-skeleton.tsx` 생성 및 로딩 상태 적용
- [x] T026 [UI] `FamilySwitcher` 및 요약 카드의 모바일 반응형(터치 영역) 최적화
- [x] T027 [UI] 연결 거절 시 보호자 대시보드에 '거절됨' 상태 피드백 UI 구현
- [x] T028 [Const] 헌법 V2 준수 감사: 버튼 크기(44px+), 글자 크기, 한국어 표기 확인
- [x] T029 [Test] 주요 시나리오(프로필 생성 -> 연결 요청 -> 승인 -> 스위칭) 수동 테스트 및 검증
