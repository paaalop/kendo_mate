CREATE OR REPLACE FUNCTION public.search_profiles_by_phone(search_phone text, target_dojo_id uuid DEFAULT NULL::uuid, requester_uuid uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, name text, birthdate date, guardian_phone text, dojo_name text, dojo_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND p.deleted_at IS NULL
    -- Exclude if already owned, in profile_guardians, or has a pending request
    AND (requester_uuid IS NULL OR (
        (p.owner_id IS NULL OR p.owner_id != requester_uuid)
        AND NOT EXISTS (
            SELECT 1 FROM profile_guardians pg
            WHERE pg.profile_id = p.id
            AND pg.guardian_id = requester_uuid
        )
        AND NOT EXISTS (
            SELECT 1 FROM link_requests lr
            WHERE lr.profile_id = p.id
            AND lr.guardian_id = requester_uuid
            AND lr.status = 'pending'
        )
    ));
END;
$function$
;