# Research & Technical Decisions

## 1. Database Management Tool
*   **Decision**: **Supabase CLI**
*   **Rationale**:
    *   **Supabase Strict** 원칙 준수.
    *   로컬 개발 환경(Docker) 제공으로 안전한 스키마 변경 가능.
    *   SQL Migration 파일을 통한 버전 관리 용이.
*   **Alternatives Considered**:
    *   **Prisma**: 편리하지만 Supabase의 native 기능(RLS, Trigger 등)을 100% 활용하기 어렵고, 불필요한 추상화 레이어가 추가됨. (Rejected)
    *   **Drizzle ORM**: 가볍지만, 초기 스키마 설정은 Raw SQL이 가장 명확하고 Supabase 문서와 일치함. 추후 클라이언트 코드 작성 시 고려 가능하나, 스키마 정의는 SQL로 진행. (Rejected)

## 2. Business Logic Location
*   **Decision**: **PostgreSQL Triggers & Functions** (Database Layer)
*   **Rationale**:
    *   **Phone Sanitization**: 클라이언트나 API 어디서 요청하든 데이터 무결성을 보장해야 함.
    *   **Profile Creation**: 회원가입 승인 시 프로필 생성은 트랜잭션으로 묶여야 하며, DB 레벨에서 처리하는 것이 가장 확실함.
    *   "Supabase Strict" 원칙에 따라 별도 백엔드 로직 없이 DB 기능 활용.

## 3. Seed Data Strategy
*   **Decision**: `seed.sql`
*   **Rationale**:
    *   Supabase CLI가 `supabase start` 또는 `db reset` 시 자동으로 실행해 줌.
    *   테스트를 위한 일관된 초기 상태(Admin 계정, 기본 커리큘럼) 보장.
