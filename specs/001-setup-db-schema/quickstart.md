# Quickstart: Database Setup

## Prerequisites
*   [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) installed.
*   Docker Desktop running.

## Local Development Setup

1.  **Initialize Project** (First time only)
    ```bash
    # (In kendo/ directory)
    supabase init
    ```

2.  **Start Local Database**
    ```bash
    supabase start
    ```
    *   This will pull Docker images and start Supabase services.
    *   Output will provide API URL, Anon Key, and **Studio URL** (e.g., http://127.0.0.1:54323).

3.  **Apply Migrations**
    ```bash
    supabase migration up
    ```

4.  **Reset Database & Apply Seeds**
    ```bash
    supabase db reset
    ```
    *   This drops the database, re-applies migrations, and runs `supabase/seed.sql`.

## Verification

1.  **Access Supabase Studio**: Open the Studio URL provided by `supabase start`.
2.  **Check Tables**: Go to `Table Editor` and verify all 10 tables exist.
3.  **Check Data**: Verify `curriculum_items` has default data and `auth.users` has the admin account.
