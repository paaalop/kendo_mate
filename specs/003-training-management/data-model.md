# Data Model: Training Management

## Entities

### Profiles (Existing)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary Key |
| name | text | 관원 이름 |
| rank_name | text | 급수 이름 (예: 1급) |
| rank_level | integer | 급수 레벨 (정렬용) |
| default_session_time | text | 수련 시간 (HH:mm) |
| dojo_id | uuid | 소속 도장 ID |

### Attendance Logs (Existing)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary Key |
| user_id | uuid | 관원 Profile ID |
| dojo_id | uuid | 도장 ID |
| attended_at | timestamp | 출석 시간 (기본 now()) |

### Curriculum Items (Existing)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary Key |
| dojo_id | uuid | 도장 ID |
| title | text | 기술명 |
| order_index | integer | 순서 |
| required_rank_level | integer | 필요 급수 |

### User Progress (Existing)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary Key |
| user_id | uuid | 관원 Profile ID |
| item_id | uuid | 기술 ID |
| completed_at | timestamp | 완료 시간 |

### Payments (Existing)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary Key |
| user_id | uuid | 관원 Profile ID |
| target_month | text | 해당 월 (YYYY-MM) |
| status | text | 결제 상태 (unpaid, pending, paid) |

## Relationships
- **Profile** (1) : (N) **Attendance Logs**
- **Profile** (1) : (N) **User Progress**
- **Curriculum Item** (1) : (N) **User Progress**
- **Profile** (1) : (N) **Payments**

## Validation Rules
- **Attendance**: 동일 관원은 하루에 하나의 `attendance_logs` 레코드만 가질 수 있음 (UI 및 DB 제약 조건).
- **Progress**: 동일 기술에 대해 중복 완료 처리 불가 (`unique(user_id, item_id)`).
- **Permission**: `owner` 또는 `instructor` 역할만 관련 테이블에 쓰기 권한을 가짐 (RLS 적용).
