-- Function to safely approve a link request and promote/link the shadow profile
-- This function runs with SECURITY DEFINER to bypass RLS restrictions that prevent
-- Dojo Staff from viewing/updating the Guardian's shadow profile (which has dojo_id=null).

CREATE OR REPLACE FUNCTION approve_link_request_promote(request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    req RECORD;
    shadow_profile_id uuid;
    guardian_profile_name text;
    guardian_profile_phone text;
    caller_id uuid := auth.uid();
BEGIN
    -- 1. Get the request
    SELECT * INTO req FROM link_requests WHERE id = request_id;
    
    IF req IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    -- 2. Check authorization: Caller must be staff of the target dojo
    -- We assume is_dojo_staff exists (created in previous migrations)
    IF NOT is_dojo_staff(req.target_dojo_id) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- 3. Find the shadow profile
    -- We match by owner_id and name. 
    -- We also try to match birthdate if available to be precise.
    SELECT id INTO shadow_profile_id
    FROM profiles
    WHERE owner_id = req.guardian_id
    AND name = req.child_name
    AND is_shadow = true
    AND (
        -- If birthdate is present in both, match it. 
        -- If null in either (legacy data?), ignore birthdate check or rely on name.
        (req.child_birthdate IS NULL OR profiles.birthdate IS NULL)
        OR
        (profiles.birthdate = req.child_birthdate)
    )
    LIMIT 1;

    IF shadow_profile_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Shadow profile not found');
    END IF;

    -- 4. Get guardian info from their profile
    SELECT name, phone INTO guardian_profile_name, guardian_profile_phone
    FROM profiles
    WHERE user_id = req.guardian_id
    AND is_shadow = false
    ORDER BY created_at ASC
    LIMIT 1;

    -- 5. Update the profile
    UPDATE profiles
    SET dojo_id = req.target_dojo_id,
        is_shadow = false, -- It is now a full member (or linked member)
        guardian_name = COALESCE(guardian_name, guardian_profile_name),
        guardian_phone = COALESCE(guardian_phone, guardian_profile_phone)
    WHERE id = shadow_profile_id;

    -- 6. Update the request
    UPDATE link_requests
    SET status = 'approved',
        updated_at = now()
    WHERE id = request_id;

    RETURN json_build_object('success', true);
END;
$$;
