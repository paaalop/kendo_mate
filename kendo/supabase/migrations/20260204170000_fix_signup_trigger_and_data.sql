-- Fix: Member Linkage & Data Consistency
-- 1. Clean existing phone numbers (remove dashes) to ensure matching works
UPDATE public.profiles 
SET phone = regexp_replace(phone, '[^0-9]', '', 'g')
WHERE phone LIKE '%-%';

UPDATE public.profiles 
SET guardian_phone = regexp_replace(guardian_phone, '[^0-9]', '', 'g')
WHERE guardian_phone LIKE '%-%';

-- 2. Update handle_signup_approval to link new users to existing shadow profiles
CREATE OR REPLACE FUNCTION public.handle_signup_approval()
RETURNS trigger AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  IF (new.status = 'approved' AND (old.status IS NULL OR old.status != 'approved')) THEN
    -- Check for existing profile (Soft deleted OR Shadow Profile)
    -- Shadow Profile: user_id IS NULL but Phone & Name match
    SELECT id INTO existing_profile_id
    FROM public.profiles
    WHERE dojo_id = new.dojo_id
    AND (
      -- Case 1: Re-joining (User ID matches)
      user_id = new.user_id
      OR
      -- Case 2: Linking to Shadow Profile (User ID is NULL, Name & Phone match)
      (user_id IS NULL AND name = new.name AND phone = new.phone)
    )
    LIMIT 1;

    IF existing_profile_id IS NOT NULL THEN
      -- Link & Restore existing profile
      UPDATE public.profiles
      SET 
        user_id = new.user_id, -- Link the user_id
        deleted_at = NULL,     -- Restore if deleted
        role = 'member',
        name = new.name,
        phone = new.phone,
        is_adult = new.is_adult,
        guardian_phone = new.guardian_phone
      WHERE id = existing_profile_id;
    ELSE
      -- Create new profile
      INSERT INTO public.profiles (
        user_id, dojo_id, role, name, phone, is_adult, guardian_phone, created_at
      ) VALUES (
        new.user_id,
        new.dojo_id,
        'member',
        new.name,
        new.phone,
        new.is_adult,
        new.guardian_phone,
        now()
      );
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
