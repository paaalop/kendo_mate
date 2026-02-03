# API & Interface Contracts (006)

## Server Actions

### 1. `createShadowProfile(data: CreateProfileInput)`
- **Input**: `{ name: string, birthDate: string }`
- **Logic**: `members` 테이블에 `owner_id`를 현재 유저로 설정하여 삽입.
- **Return**: `Promise<{ success: boolean, profileId?: string }>`

### 2. `requestDojoLink(profileId: string, dojoId: string)`
- **Input**: `profileId`, `dojoId`
- **Logic**: `link_requests` 테이블에 데이터 삽입 및 도장 관리자에게 알림(Optional MVP).
- **Return**: `Promise<{ success: boolean }>`

### 3. `switchProfile(profileId: string)`
- **Input**: `profileId`
- **Logic**: 클라이언트 사이드에서 URL 파라미터 업데이트 및 쿠키 설정.
- **Return**: `void`

## Database RPCs

### 1. `get_member_progress(p_member_id uuid)`
- **Returns**: `{ rank_name: string, current_item: string, progress_percent: number }`
- **Logic**:
    1. 현재 급수(Rank) 조회.
    2. `user_progress`에 없는 항목 중 `order_index`가 가장 낮은 `curriculum_item` 조회.
    3. 해당 항목의 하위 작업 달성률 계산.
