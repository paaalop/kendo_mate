# Data Model

## Tables

### 1. dojos (Tenants)
*   **Description**: 도장 정보 (Tenant)
*   **Columns**:
    *   `id`: UUID (PK, Default: `gen_random_uuid()`)
    *   `name`: Text (Not Null)
    *   `owner_id`: UUID (Not Null, FK: `auth.users.id`)
    *   `default_fee`: Integer (Default: 150000)
    *   `trial_ends_at`: Timestamptz (Default: `now() + interval '14 days'`)
    *   `created_at`: Timestamptz (Default: `now()`)

### 2. profiles (Users)
*   **Description**: 사용자 프로필
*   **Columns**:
    *   `id`: UUID (PK, Default: `gen_random_uuid()`)
    *   `user_id`: UUID (Nullable, FK: `auth.users.id`)
    *   `dojo_id`: UUID (FK: `dojos.id`)
    *   `role`: Text (Default: 'member', Check: 'owner'|'instructor'|'member'|'guardian')
    *   `name`: Text (Not Null)
    *   `phone`: Text (Sanitized, Index)
    *   `rank_level`: Integer (Default: 0)
    *   `rank_name`: Text (Default: '무급')
    *   `default_session_time`: Text
    *   `is_adult`: Boolean (Default: false)
    *   `guardian_name`: Text
    *   `guardian_phone`: Text (Sanitized, Index)
    *   `created_at`: Timestamptz (Default: `now()`)
*   **Constraints**:
    *   Unique `(dojo_id, phone)`

### 3. signup_requests (Onboarding)
*   **Description**: 가입 요청 대기열
*   **Columns**:
    *   `id`: UUID (PK)
    *   `dojo_id`: UUID (FK: `dojos.id`)
    *   `user_id`: UUID (FK: `auth.users.id`)
    *   `name`: Text (Not Null)
    *   `phone`: Text
    *   `guardian_phone`: Text
    *   `is_adult`: Boolean (Default: false)
    *   `status`: Text (Default: 'pending', Check: 'pending'|'approved'|'rejected')
    *   `created_at`: Timestamptz

### 4. curriculum_items (Curriculum)
*   **Description**: 커리큘럼 항목
*   **Columns**:
    *   `id`: UUID (PK)
    *   `dojo_id`: UUID (FK: `dojos.id`)
    *   `title`: Text (Not Null)
    *   `category`: Text (Check: 'basic'|'technique'|'sparring')
    *   `order_index`: Integer (Not Null)
    *   `required_rank_level`: Integer
    *   `created_at`: Timestamptz

### 5. user_progress (Progress)
*   **Description**: 사용자 진도 현황
*   **Columns**:
    *   `id`: UUID (PK)
    *   `user_id`: UUID (FK: `profiles.id`)
    *   `item_id`: UUID (FK: `curriculum_items.id`)
    *   `status`: Text (Default: 'completed')
    *   `completed_at`: Timestamptz
*   **Constraints**:
    *   Unique `(user_id, item_id)`

### 6. attendance_logs (Attendance)
*   **Description**: 출석 기록
*   **Columns**:
    *   `id`: UUID (PK)
    *   `dojo_id`: UUID (FK: `dojos.id`)
    *   `user_id`: UUID (FK: `profiles.id`)
    *   `attended_at`: Timestamptz (Default: `now()`)
    *   `check_type`: Text (Default: 'manual', Check: 'manual'|'qr'|'face')
    *   `created_at`: Timestamptz

### 7. payments (Payments)
*   **Description**: 수납 기록
*   **Columns**:
    *   `id`: UUID (PK)
    *   `dojo_id`: UUID (FK: `dojos.id`)
    *   `user_id`: UUID (FK: `profiles.id`, OnDelete: Set Null)
    *   `target_month`: Text (Not Null, Format 'YYYY-MM')
    *   `amount`: Integer (Not Null)
    *   `payment_date`: Timestamptz
    *   `status`: Text (Default: 'unpaid', Check: 'unpaid'|'pending'|'paid')
    *   `created_at`: Timestamptz
*   **Constraints**:
    *   Unique `(user_id, target_month)`

### 8. notices (Notices)
*   **Description**: 공지사항
*   **Columns**:
    *   `id`: UUID (PK)
    *   `dojo_id`: UUID (FK: `dojos.id`)
    *   `author_id`: UUID (FK: `profiles.id`)
    *   `title`: Text (Not Null)
    *   `content`: Text (Not Null)
    *   `is_pinned`: Boolean (Default: false)
    *   `created_at`: Timestamptz

### 9. posts (Community)
*   **Description**: 자유게시판
*   **Columns**:
    *   `id`: UUID (PK)
    *   `dojo_id`: UUID (FK: `dojos.id`)
    *   `author_id`: UUID (FK: `profiles.id`)
    *   `category`: Text (Default: 'free', Check: 'free'|'qna'|'cert')
    *   `title`: Text (Not Null)
    *   `content`: Text (Not Null)
    *   `image_url`: Text
    *   `view_count`: Integer (Default: 0)
    *   `created_at`: Timestamptz

### 10. comments (Comments)
*   **Description**: 댓글
*   **Columns**:
    *   `id`: UUID (PK)
    *   `post_id`: UUID (FK: `posts.id`, OnDelete: Cascade)
    *   `author_id`: UUID (FK: `profiles.id`)
    *   `content`: Text (Not Null)
    *   `created_at`: Timestamptz

## Security (RLS)
*   **Default Policy**: MVP 단계에서는 `payments`를 제외한 모든 테이블에 대해 **Public Access (True)** 적용.
*   **Payments**: `instructor` role을 가진 유저는 접근 불가 (Deny Policy).

## Storage
*   **Bucket**: `images` (Public)
