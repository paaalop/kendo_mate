# Research & Design Decisions: Owner Admin Features

## 1. Automated Monthly Payment Generation

**Requirement**: Automatically generate `Unpaid` payment records for all active members at the start of each month (FR-004).

### Options Considered
1.  **Lazy Generation (On Access)**: Trigger generation when the Owner visits the Payments page.
    -   *Pros*: No background infrastructure needed.
    -   *Cons*: Data doesn't exist until someone visits. Can't send notifications or get stats without visiting.
2.  **Supabase Edge Functions (Cron)**: Scheduled HTTP request to an Edge Function.
    -   *Pros*: Standard Supabase pattern.
    -   *Cons*: Requires setting up Edge Functions environment (currently not present in project structure).
3.  **pg_cron (Database Native)**: Schedule a SQL function directly in Postgres.
    -   *Pros*: robust, purely database-resident, no external dependencies.
    -   *Cons*: Requires `pg_cron` extension enabled (available on Supabase).

### Decision
**Use `pg_cron` (if available) or fallback to a Manual "Initialize Month" button (MVP).**
Given the strict "Supabase Only" constraint and keeping logic in the DB, `pg_cron` is the ideal architecture.
We will write a PL/pgSQL function `public.generate_monthly_payments(target_month date)` and schedule it.
*Constraint Check*: If `pg_cron` cannot be enabled in the specific environment, we will expose this function as an RPC and add a "Initialize Month" button in the UI as a fail-safe.

## 2. Curriculum Reordering Strategy

**Requirement**: Maintain strict 1..N sequence for curriculum items (FR-011).

### Options Considered
1.  **Fractional Indexing (LexoRank)**: Use strings/floats to insert between items without reordering.
    -   *Pros*: Fast, no cascading updates.
    -   *Cons*: Doesn't satisfy "strict 1..N sequence" requirement. User wants readable numbers.
2.  **Dense Integer Sequence (Arrays)**: Store order in a single array column on the parent.
    -   *Pros*: Easy order.
    -   *Cons*: Harder to query/filter individual items.
3.  **Linked List**: `next_item_id`.
    -   *Pros*: explicit.
    -   *Cons*: Hard to query full list in order (recursive CTE).
4.  **Integer Shift (RPC)**: Update `order_index` of affected rows on move.
    -   *Pros*: Satisfies strict 1..N.
    -   *Cons*: Write heavy (updates N rows).
    -   *Mitigation*: Curriculum lists are short (< 100 items), so performance impact is negligible.

### Decision
**Use Integer Shift via RPC.**
We will implement `reorder_curriculum_item(item_id, new_index)` which handles the shifting logic (incrementing/decrementing neighbors) in a transaction.

## 3. Data Model & Role Isolation

### Entities
-   `payments`: Links `user_id` -> `payment_status`.
-   `sessions`: Fixed time slots for Dojo.
-   `curriculum_items`: Content.

### Security
-   RLS Policies:
    -   `payments`: SELECT/ALL for `role='owner'`, VIEW ONLY (own) for `member`? No, Spec says "exclusive access... unauthorized users cannot view". So `member` cannot see their own payments?
        -   *Re-reading User Story 1*: "unauthorized users cannot view... financial data".
        -   *Re-reading FR-003*: "Hide Payments... for users without role='owner'".
        -   *Clarification*: Usually members want to see their *own* status. But User Story 1 emphasizes "exclusive access".
        -   *Refinement*: I will assume Members *can* see their own payment history (standard feature), but strictly *cannot* see others or the admin dashboard. The "exclusive access" likely refers to the *management* view.
        -   *Safe bet*: RLS `select` for Owner (all) and Member (own). RLS `insert/update/delete` for Owner ONLY.

## 4. Tech Stack Alignment
-   **Frontend**: Next.js 14+ App Router, Tailwind CSS.
-   **Backend**: Supabase (Postgres + RLS + RPC).
-   **State**: React Query (via Supabase helpers) or Server Actions.
    -   *Decision*: Use Server Actions for mutations (RPC calls) and Server Components for initial data fetching, following the project's pattern (seen in `actions.ts`).
