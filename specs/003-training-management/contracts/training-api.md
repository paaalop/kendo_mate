# API Contract: Training Management

## 1. Get Members for Training
- **Purpose**: 수련 관리 화면에 필요한 관원 리스트 및 상태 정보를 한 번에 조회합니다.
- **Query**: `profiles` 테이블을 기반으로 `attendance_logs`, `user_progress`, `payments` 정보를 조인하여 가져옵니다.
- **Fields**:
  - `id`, `name`, `rank_name`, `default_session_time`
  - `is_attended_today`: 오늘 날짜의 `attendance_logs` 존재 여부
  - `current_technique`: `user_progress`에 없는 가장 낮은 `order_index`의 `curriculum_items.title`
  - `unpaid_months_count`: `payments.status = 'unpaid'` 개수

## 2. Toggle Attendance
- **Action**: [출석] 버튼 클릭 시 동작
- **Request**: `{ user_id: UUID, dojo_id: UUID, date: ISO8601 }`
- **Method**: 
  - 기록이 없으면 `INSERT`
  - 기록이 있으면 `DELETE` (당일 기록에 한함)

## 3. Pass Technique
- **Action**: [기술 통과] 버튼 클릭 시 동작
- **Request**: `{ user_id: UUID, item_id: UUID }`
- **Method**: `INSERT` into `user_progress`
- **Response**: 다음 기술 정보 (또는 전체 리스트 재조회)

## 4. Send Promotion Notification
- **Action**: [심사 알림 보내기] 버튼 클릭 시 동작
- **Request**: `{ dojo_id: UUID, author_id: UUID, month: string }`
- **Method**: `INSERT` into `notices`
  - `title`: `[심사 공지] {month}월 승급 심사 안내`
  - `content`: `{month}월 승급 심사가 진행됩니다...`
