-- Migration: 20260204183000_add_birthdate_to_signup_requests.sql
-- Description: Adds birthdate column to signup_requests and updates the approval trigger.

-- 1. Add birthdate column to signup_requests
ALTER TABLE public.signup_requests 
ADD COLUMN IF NOT EXISTS birthdate DATE;

-- 2. Update handle_signup_approval trigger function to handle birthdate
CREATE OR REPLACE FUNCTION public.handle_signup_approval()
RETURNS trigger AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  IF (new.status = 'approved' AND (old.status IS NULL OR old.status != 'approved')) THEN
    -- Check for existing profile (Soft deleted OR Shadow Profile)
    -- We match by:
    -- Case 1: Re-joining (User ID matches)
    -- Case 2: Linking to Shadow Profile (User ID is NULL, Name & Birthdate match)
    -- We prioritize matching by user_id first, then by (name, birthdate).
    
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
      -- Link & Restore existing profile
      UPDATE public.profiles
      SET 
        user_id = new.user_id,
        deleted_at = NULL,
        role = 'member',
        name = new.name,
        phone = new.phone,
        is_adult = new.is_adult,
        guardian_phone = new.guardian_phone,
        birthdate = new.birthdate -- Update birthdate as well
      WHERE id = existing_profile_id;
    ELSE
      -- Create new profile
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
