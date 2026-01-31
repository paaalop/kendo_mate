# Research: Training Management

## 1. `default_session_time` 형식 및 정렬
- **결정**: `HH:mm` 형식 (24시간제) 문자열로 저장하고, UI에서는 필요 시 12시간제로 변환하여 표시한다.
- **근거**: 시간순 정렬(`ORDER BY default_session_time ASC`)이 용이하며, 표준적인 시간 표현 방식이다.
- **예시**: "05:00", "14:00", "18:30"

## 2. '현재 배우는 기술' 조회 로직
- **결정**: `curriculum_items`와 `user_progress`를 LEFT JOIN 하여, `user_progress.id IS NULL`인 항목 중 `order_index`가 가장 낮은 것을 선택한다.
- **쿼리 의사코드**:
  ```sql
  SELECT ci.*
  FROM curriculum_items ci
  LEFT JOIN user_progress up ON ci.id = up.item_id AND up.user_id = :user_id
  WHERE ci.dojo_id = :dojo_id
    AND ci.required_rank_level <= :user_rank_level
    AND up.id IS NULL
  ORDER BY ci.order_index ASC
  LIMIT 1;
  ```
- **최적화**: 관원 리스트 조회 시 개별적으로 쿼리하면 성능 저하 우려가 있으므로, View를 생성하거나 단일 RPC로 조회하는 것을 고려한다.

## 3. Optimistic UI 구현
- **결정**: `useState`와 `useTransition`을 활용한 수동 상태 업데이트 또는 `react-query`의 `onMutate`를 사용한다. 본 프로젝트는 Supabase SDK를 직접 사용하므로, UI 상태를 즉시 변경하고 실패 시 롤백하는 로직을 컴포넌트 내부에 구현한다.
- **로직**:
  1. 버튼 클릭 시 `attendanceLogs` 로컬 상태 즉시 토글.
  2. Supabase INSERT/DELETE 요청.
  3. 에러 발생 시 로컬 상태 원복 및 Toast 메시지 출력.

## 4. 승급 심사 알림 (Notices 자동 생성)
- **결정**: 클라이언트 사이드에서 `notices` 테이블에 직접 INSERT 한다. (FR-013)
- **형식**: 
  - 제목: `[심사 공지] {selectedMonth} 승급 심사 안내`
  - 내용: `{selectedMonth} 승급 심사가 진행될 예정입니다. 대상 관원들은 준비해 주세요.`

## 5. 미납 상태 확인
- **결정**: `payments` 테이블에서 `status = 'unpaid'`인 레코드의 개수를 카운트하여 "X개월 미납" 형식으로 표시한다.
