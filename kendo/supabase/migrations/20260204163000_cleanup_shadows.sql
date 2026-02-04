-- Function to clean up shadow profiles after linking
CREATE OR REPLACE FUNCTION cleanup_shadow_profiles(
    target_guardian_id UUID, 
    target_name TEXT, 
    target_birthdate DATE DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM profiles
    WHERE owner_id = target_guardian_id
    AND is_shadow = true
    AND name = target_name
    -- Match birthdate if both have it, or rely on name if one is missing
    AND (
        target_birthdate IS NULL 
        OR birthdate IS NULL 
        OR birthdate = target_birthdate
    );
END;
$$;

-- Update link_child RPC to use this cleanup
CREATE OR REPLACE FUNCTION link_child(child_profile_id UUID, relation TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_phone TEXT;
    target_profile profiles%ROWTYPE;
BEGIN
    -- Get phone
    SELECT phone INTO user_phone FROM auth.users WHERE id = auth.uid();
    
    IF user_phone IS NULL THEN
        RAISE EXCEPTION 'Phone number not found for user';
    END IF;

    -- Check if profile exists
    SELECT * INTO target_profile
    FROM profiles
    WHERE id = child_profile_id;

    IF target_profile.id IS NULL THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    -- Compare phones (Normalization recommended in production)
    IF target_profile.guardian_phone != user_phone THEN
         RAISE EXCEPTION 'Phone number mismatch';
    END IF;

    -- Insert into profile_guardians
    INSERT INTO profile_guardians (profile_id, guardian_id, relationship, is_primary)
    VALUES (child_profile_id, auth.uid(), relation, false)
    ON CONFLICT (profile_id, guardian_id) DO NOTHING;

    -- Cleanup Shadows
    PERFORM cleanup_shadow_profiles(auth.uid(), target_profile.name, target_profile.birthdate);
END;
$$;
