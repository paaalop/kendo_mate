-- Fix for Bug 1: Allow searching for children by phone without RLS issues
-- Updated to include optional target_dojo_id filtering
CREATE OR REPLACE FUNCTION public.search_profiles_by_phone(search_phone TEXT, target_dojo_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name TEXT,
    birthdate DATE,
    guardian_phone TEXT,
    dojo_name TEXT,
    dojo_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.birthdate,
        p.guardian_phone,
        d.name as dojo_name,
        p.dojo_id
    FROM profiles p
    LEFT JOIN dojos d ON p.dojo_id = d.id
    WHERE (p.guardian_phone = search_phone OR REPLACE(p.guardian_phone, '-', '') = REPLACE(search_phone, '-', ''))
    AND (target_dojo_id IS NULL OR p.dojo_id = target_dojo_id)
    AND p.deleted_at IS NULL;
END;
$$;

-- Fix for Bug 2: Update guardian summary to be more robust
CREATE OR REPLACE FUNCTION public.get_guardian_summary(guardian_uuid uuid)
 RETURNS TABLE(member_id uuid, name text, dojo_name text, last_attendance_date timestamp with time zone, unpaid_count bigint, unpaid_amount bigint, link_status text, link_request_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS member_id,
        p.name,
        d.name AS dojo_name,
        (
            SELECT MAX(al.attended_at)
            FROM attendance_logs al
            WHERE al.user_id = p.id
        ) AS last_attendance_date,
        (
            SELECT COUNT(*)
            FROM payments py
            WHERE py.user_id = p.id AND py.status = 'unpaid'
        ) AS unpaid_count,
        (
            SELECT COALESCE(SUM(py.amount), 0)
            FROM payments py
            WHERE py.user_id = p.id AND py.status = 'unpaid'
        ) AS unpaid_amount,
        lr.status AS link_status,
        'link'::text AS link_request_type -- Default or derived from recent request
    FROM profiles p
    LEFT JOIN dojos d ON p.dojo_id = d.id
    LEFT JOIN LATERAL (
        SELECT status
        FROM link_requests
        WHERE guardian_id = guardian_uuid 
        AND profile_id = p.id
        ORDER BY created_at DESC
        LIMIT 1
    ) lr ON TRUE
    WHERE p.owner_id = guardian_uuid
       OR EXISTS (
           SELECT 1 FROM profile_guardians pg 
           WHERE pg.profile_id = p.id 
           AND pg.guardian_id = guardian_uuid
       );
END;
$function$;