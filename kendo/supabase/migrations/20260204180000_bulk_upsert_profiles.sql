-- Migration: 20260204180000_bulk_upsert_profiles.sql
-- Description: Adds the bulk_upsert_profiles RPC function for admin member upload.

CREATE OR REPLACE FUNCTION public.bulk_upsert_profiles(profiles_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record jsonb;
  v_dojo_id uuid;
  v_name text;
  v_birthdate date;
  v_phone text;
  v_guardian_phone text;
  v_role text;
BEGIN
  -- Iterate through the provided profiles
  FOR profile_record IN SELECT * FROM jsonb_array_elements(profiles_data)
  LOOP
    v_dojo_id := (profile_record->>'dojo_id')::uuid;
    v_name := profile_record->>'name';
    v_birthdate := (profile_record->>'birthdate')::date;
    v_phone := profile_record->>'phone';
    v_guardian_phone := profile_record->>'guardian_phone';
    v_role := COALESCE(profile_record->>'role', 'member');

    -- Try to update an existing record (matching by dojo_id, name, and birthdate)
    -- We only target profiles that are NOT deleted.
    UPDATE public.profiles
    SET
      phone = COALESCE(v_phone, profiles.phone),
      guardian_phone = COALESCE(v_guardian_phone, profiles.guardian_phone),
      role = v_role
    WHERE 
      dojo_id = v_dojo_id 
      AND name = v_name 
      AND (
        (birthdate IS NULL AND v_birthdate IS NULL) 
        OR (birthdate = v_birthdate)
      )
      AND deleted_at IS NULL;

    -- If no record was updated, insert a new one
    IF NOT FOUND THEN
      INSERT INTO public.profiles (
        dojo_id,
        name,
        birthdate,
        phone,
        guardian_phone,
        role,
        is_shadow
      )
      VALUES (
        v_dojo_id,
        v_name,
        v_birthdate,
        v_phone,
        v_guardian_phone,
        v_role,
        TRUE
      );
    END IF;
  END LOOP;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.bulk_upsert_profiles(jsonb) TO authenticated;
