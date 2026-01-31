-- 1. Add deleted_at to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- 2. Drop existing foreign keys to recreate with CASCADE
ALTER TABLE public.dojos DROP CONSTRAINT IF EXISTS dojos_owner_id_fkey;
ALTER TABLE public.dojos ADD CONSTRAINT dojos_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_dojo_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_dojo_id_fkey 
    FOREIGN KEY (dojo_id) REFERENCES public.dojos(id) ON DELETE CASCADE;

ALTER TABLE public.signup_requests DROP CONSTRAINT IF EXISTS signup_requests_dojo_id_fkey;
ALTER TABLE public.signup_requests ADD CONSTRAINT signup_requests_dojo_id_fkey 
    FOREIGN KEY (dojo_id) REFERENCES public.dojos(id) ON DELETE CASCADE;

-- 3. Update handle_signup_approval function for Soft Delete
CREATE OR REPLACE FUNCTION public.handle_signup_approval()
RETURNS trigger AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  IF (new.status = 'approved' AND (old.status IS NULL OR old.status != 'approved')) THEN
    -- Check for existing soft-deleted profile
    SELECT id INTO existing_profile_id
    FROM public.profiles
    WHERE user_id = new.user_id AND dojo_id = new.dojo_id;

    IF existing_profile_id IS NOT NULL THEN
      -- Restore existing profile
      UPDATE public.profiles
      SET 
        deleted_at = NULL,
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

-- 4. Case-insensitive Unique Index for Dojo Name (FR-014)
CREATE UNIQUE INDEX IF NOT EXISTS dojos_name_unique_idx ON public.dojos (LOWER(name));
