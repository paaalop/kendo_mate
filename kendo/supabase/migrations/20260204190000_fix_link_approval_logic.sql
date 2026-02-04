-- Fix for link approval logic and guardian summary visibility

-- 1. Add missing INSERT policy for Dojo admins to profile_guardians
-- This allows dojo owners to complete the link approval process
DROP POLICY IF EXISTS "Dojo admins can insert links for their profiles" ON profile_guardians;
CREATE POLICY "Dojo admins can insert links for their profiles" ON profile_guardians
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        JOIN dojos ON profiles.dojo_id = dojos.id
        WHERE profiles.id = profile_guardians.profile_id
        AND dojos.owner_id = auth.uid()
    )
);

-- 2. Update get_guardian_summary to include profiles linked via profile_guardians table
-- This ensures that students with existing profiles (not just shadow profiles) 
-- are visible in the guardian's dashboard after approval.
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
