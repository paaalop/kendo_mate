# Quickstart: Training Management

## 개발 준비
1. **Supabase 로컬 환경 실행**:
   ```bash
   npx supabase start
   ```
2. **필요 데이터 시딩**:
   `kendo/supabase/seed.sql`에 테스트용 관원, 시간표, 커리큘럼 데이터를 추가합니다.

## 주요 구현 경로
- **페이지**: `kendo/app/(dashboard)/training/page.tsx`
- **컴포넌트**:
  - `kendo/components/training/training-container.tsx` (탭 관리)
  - `kendo/components/training/member-card.tsx` (개별 관원 카드)
  - `kendo/components/training/promotion-manager.tsx` (상단 알림 설정)
- **액션**: `kendo/app/(dashboard)/training/actions.ts` (Server Actions)

## 실행 방법
1. `http://localhost:3000/training` 접속 (로그인 필요).
2. '관장' 또는 '사범' 계정으로 접속하여 탭별 관원 리스트가 노출되는지 확인합니다.
3. [출석] 버튼을 클릭하여 즉각적으로 UI가 변경되는지(Optimistic UI) 확인합니다.
