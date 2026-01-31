# Quickstart: User Onboarding Feature

## Prerequisites
- Supabase CLI installed and linked.
- Database running (`supabase start` or remote).

## Setup
1. **Apply Schema Changes**:
   Run the migration script to update schema.
   ```bash
   supabase migration new user_onboarding
   # Copy content from specs/002-user-onboarding/contracts/schema.sql to the new migration file
   supabase db reset # OR supabase db push
   ```

2. **Generate Types**:
   Update TypeScript definitions.
   ```bash
   supabase gen types typescript --local > kendo/supabase/types/supabase.ts
   ```

3. **Verify RLS**:
   Ensure RLS policies are active.
   ```sql
   -- Check policies
   select * from pg_policies where tablename = 'dojos';
   ```

## Running the App
1. **Frontend**:
   ```bash
   cd kendo
   npm install
   npm run dev
   ```
2. **Access**:
   - URL: `http://localhost:3000`
   - Sign up flow: `/signup` (or similar, needs implementation).
