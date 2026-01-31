---

description: "수련 관리 기능 구현을 위한 실행 가능한 작업 목록"
---

# 작업 목록: 수련 관리 (003-training-management)

**입력**: `/specs/003-training-management/`의 설계 문서
**선행 작업**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md)

**테스트**: 구현 계획에 따라 Playwright(E2E) 및 Vitest(단위 테스트)를 포함합니다.

## 형식: `[ID] [P?] [Story] 설명`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 관련 사용자 스토리 (US1: 출석, US2: 진도, US3: 심사, US4: 미납)

---

## 1단계: 설정 (공통 인프라)

**목적**: 프로젝트 디렉토리 구조 및 기본 유효성 검사 설정

- [X] T001 `kendo/app/(dashboard)/training/` 및 `kendo/components/training/` 디렉토리 생성
- [X] T002 [P] `kendo/lib/validations/training.ts`에 심사 알림 등 액션용 Zod 스키마 정의
- [X] T003 [P] 수련 모듈용 Vitest 및 Playwright 경로 설정 확인

---

## 2단계: 기반 구현 (필수 선행 작업)

**목적**: 데이터 페칭 및 핵심 서버 액션 구현 (모든 사용자 스토리의 차단 요소)

- [X] T004 `kendo/app/(dashboard)/training/actions.ts`에 `fetchTrainingData` 서버 액션 구현 (프로필, 출석, 진도, 미납 데이터 조인 및 **활성 관원 필터링** 포함)
- [X] T005 [P] `kendo/app/(dashboard)/training/actions.ts`에 `toggleAttendance` 서버 액션 구현 (기록 추가/삭제 토글)
- [X] T006 [P] `kendo/app/(dashboard)/training/actions.ts`에 `passTechnique` 서버 액션 구현 (진도 완료 처리 및 취소)
- [X] T007 [P] `kendo/app/(dashboard)/training/actions.ts`에 `sendPromotionNotification` 서버 액션 구현 (정의된 템플릿 사용)
- [X] T008 [P] `kendo/app/(dashboard)/training/layout.tsx`에서 `owner`/`instructor` 역할 기반 접근 제어(RBAC) 구현

---

## 3단계: 사용자 스토리 1 - 일일 출석 및 관원 리스트 (우선순위: P1) 🎯 MVP

**목표**: 시간표별 그룹화, 검색 기능, Optimistic UI를 활용한 원터치 출석 제공.

### 테스트 (US1)

- [ ] T009 [P] [US1] `kendo/__tests__/training/actions.test.ts`에서 데이터 그룹화 및 정렬 로직 단위 테스트
- [ ] T010 [P] [US1] `kendo/e2e/training/attendance.spec.ts`에서 출석 토글 및 검색어 유지 E2E 테스트

### 구현 (US1)

- [X] T011 [P] [US1] `kendo/components/training/member-card.tsx` 기본 UI 개발 (이름, 급수 표시)
- [X] T012 [P] [US1] `kendo/components/training/attendance-button.tsx` 개발 (**Optimistic UI** 적용 및 **실패 시 롤백/토스트 알림** 로직 포함)
- [X] T013 [P] [US1] `kendo/components/training/training-search.tsx` 검색 컴포넌트 개발 (이름/번호)
- [X] T014 [US1] `kendo/components/training/training-container.tsx` 개발 (세션 탭 관리 및 관원 카드 배치)
- [X] T015 [US1] `kendo/app/(dashboard)/training/page.tsx` 메인 페이지 조립 및 상단 출석 통계(X/Y) 표시

---

## 4단계: 사용자 스토리 2 - 수련 진도 관리 (우선순위: P1)

**목표**: 기술 통과 처리 및 다음 커리큘럼 항목 자동 표시.

### 테스트 (US2)

- [ ] T016 [P] [US2] `kendo/__tests__/training/progress.test.ts`에서 "다음 기술" 계산 로직 단위 테스트
- [ ] T017 [P] [US2] `kendo/e2e/training/progress.spec.ts`에서 기술 통과 및 취소 흐름 E2E 테스트

### 구현 (US2)

- [X] T018 [P] [US2] `kendo/components/training/pass-button.tsx` 개발 (취소 기능 포함)
- [X] T019 [US2] `kendo/components/training/member-card.tsx`에 `PassButton` 통합 및 **커리큘럼 완료 시 UI 처리** 로직 추가
- [X] T020 [US2] `kendo/components/training/member-card.tsx`에 기술 완료 시 성공 토스트 알림 추가

---

## 5단계: 사용자 스토리 3 - 승급 심사 관리 (우선순위: P2)

**목표**: 심사 대상 월 선택 및 전체 공지 알림 전송.

### 테스트 (US3)

- [ ] T021 [P] [US3] `kendo/__tests__/training/notifications.test.ts`에서 알림 생성 서버 액션 단위 테스트

### 구현 (US3)

- [X] T022 [P] [US3] `kendo/components/training/promotion-manager.tsx` 개발 (월 선택기 및 전송 버튼)
- [X] T023 [US3] `kendo/app/(dashboard)/training/page.tsx` 상단에 `PromotionManager` 통합

---

## 6단계: 사용자 스토리 4 - 회비 미납 상태 확인 (우선순위: P2)

**목표**: 미납 관원 하이라이트 및 미납 개월 수 표시.

### 구현 (US4)

- [X] T024 [P] [US4] `kendo/components/training/unpaid-badge.tsx` 개발 (클릭 시 개월 수 표시 팝오버/툴팁)
- [X] T025 [US4] `kendo/components/training/member-card.tsx`에 `UnpaidBadge` 통합 (`unpaid_months_count > 0`일 때만 노출)

---

## 7단계: 마무리 및 기타 사항

**목적**: UI/UX 정밀 조정 및 최종 보안 점검.

- [X] T026 [P] 모든 버튼의 모바일 터치 영역(44px+) 준수 여부 확인
- [X] T027 [P] `kendo/components/training/training-skeleton.tsx`에 로딩 스켈레톤 추가
- [X] T028 전체 페이지 반응형 디자인(Mobile-First) 최종 점검
- [X] T029 `quickstart.md`의 검증 시나리오 실행 및 최종 확인