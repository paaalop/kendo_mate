CREATE OR REPLACE FUNCTION public.bulk_upsert_profiles(profiles_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  profile_record jsonb;
  v_dojo_id uuid;
  v_name text;
  v_birthdate date;
  v_phone text;
  v_guardian_phone text;
  v_role text;
  v_default_session_time text;
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
    v_default_session_time := profile_record->>'default_session_time';

    -- Try to update an existing record (matching by dojo_id, name, and birthdate)
    -- We only target profiles that are NOT deleted.
    UPDATE public.profiles
    SET
      phone = COALESCE(v_phone, profiles.phone),
      guardian_phone = COALESCE(v_guardian_phone, profiles.guardian_phone),
      role = v_role,
      default_session_time = COALESCE(v_default_session_time, profiles.default_session_time)
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
        is_shadow,
        default_session_time
      )
      VALUES (
        v_dojo_id,
        v_name,
        v_birthdate,
        v_phone,
        v_guardian_phone,
        v_role,
        TRUE,
        v_default_session_time
      );
    END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_signup_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  existing_profile_id uuid;
BEGIN
  IF (new.status = 'approved' AND (old.status IS NULL OR old.status != 'approved')) THEN
    SELECT id INTO existing_profile_id
    FROM public.profiles
    WHERE dojo_id = new.dojo_id
    AND (
      user_id = new.user_id
      OR
      (
        user_id IS NULL
        AND name = new.name
        AND (
            (birthdate IS NULL AND new.birthdate IS NULL)
            OR (birthdate = new.birthdate)
        )
      )
    )
    LIMIT 1;

    IF existing_profile_id IS NOT NULL THEN
      UPDATE public.profiles
      SET
        user_id = new.user_id,
        deleted_at = NULL,
        role = 'member',
        name = new.name,
        phone = new.phone,
        is_adult = new.is_adult,
        guardian_phone = new.guardian_phone,
        birthdate = new.birthdate
      WHERE id = existing_profile_id;
    ELSE
      INSERT INTO public.profiles (
        user_id,
        dojo_id,
        role,
        name,
        phone,
        is_adult,
        guardian_phone,
        birthdate,
        created_at
      ) VALUES (
        new.user_id,
        new.dojo_id,
        'member',
        new.name,
        new.phone,
        new.is_adult,
        new.guardian_phone,
        new.birthdate,
        now()
      );
    END IF;
  END IF;
  RETURN new;
END;
$function$
;