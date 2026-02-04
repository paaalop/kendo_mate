-- Fix get_members_v2 RPC issue by upgrading to v3 with consistent parameter ordering
-- Path: kendo/supabase/migrations/20260205000000_fix_get_members_rpc_v3.sql

CREATE OR REPLACE FUNCTION public.get_members_v3(
    p_dojo_id uuid,
    p_page integer DEFAULT 0,
    p_page_size integer DEFAULT 20,
    p_search text DEFAULT ''::text
)
 RETURNS TABLE(id uuid, user_id uuid, dojo_id uuid, role text, name text, phone text, rank_level integer, rank_name text, default_session_time text, is_adult boolean, guardian_name text, guardian_phone text, created_at timestamp with time zone, deleted_at timestamp with time zone, owner_id uuid, is_shadow boolean, birthdate date, total_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH filtered_members AS (
    SELECT
      m.*
    FROM
      public.profiles m
    WHERE
      m.dojo_id = p_dojo_id
      AND m.deleted_at IS NULL
      AND (
        p_search = ''
        OR m.name ILIKE '%' || p_search || '%'
        OR m.phone ILIKE '%' || p_search || '%'
      )
  ),
  total AS (
    SELECT count(*) as count FROM filtered_members
  )
  SELECT
    f.*,
    t.count as total_count
  FROM
    filtered_members f,
    total t
  ORDER BY
    CASE
      WHEN f.role = 'owner' THEN 4
      WHEN f.role = 'instructor' THEN 3
      WHEN f.role = 'member' THEN 2
      WHEN f.role = 'guardian' THEN 1
      ELSE 0
    END DESC,
    f.rank_level DESC,
    f.name ASC
  OFFSET p_page * p_page_size
  LIMIT p_page_size;
END;
$function$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_members_v3 TO anon, authenticated, service_role;

-- Cleanup old versions to avoid confusion
DROP FUNCTION IF EXISTS public.get_members_v2(uuid, integer, integer, text);
DROP FUNCTION IF EXISTS public.get_members_v2(uuid, text, integer, integer);
