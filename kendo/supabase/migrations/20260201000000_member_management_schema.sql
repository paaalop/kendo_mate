-- 1. Profiles Partial Index for Soft Delete
-- First drop the existing unique constraint (it was created as unique (dojo_id, phone))
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_dojo_id_phone_key;

-- Create partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_active ON public.profiles (dojo_id, phone) WHERE deleted_at IS NULL;

-- 2. Rank History Table
CREATE TABLE IF NOT EXISTS public.rank_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dojo_id uuid NOT NULL REFERENCES public.dojos(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    previous_rank text,
    new_rank text NOT NULL,
    promoted_by uuid REFERENCES public.profiles(id),
    promoted_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rank_history ENABLE ROW LEVEL SECURITY;

-- 3. Rank History Policies
CREATE POLICY "dojo_member_select_rank_history" ON public.rank_history
FOR SELECT TO authenticated USING (
    is_dojo_member(dojo_id)
);

CREATE POLICY "dojo_staff_modify_rank_history" ON public.rank_history
FOR ALL TO authenticated USING (
    is_dojo_staff(dojo_id)
);

-- 4. RPC: update_member_role
CREATE OR REPLACE FUNCTION public.update_member_role(
    target_member_id uuid,
    new_role text
)
RETURNS void AS $$
DECLARE
    caller_role text;
    target_dojo_id uuid;
    caller_profile_id uuid;
BEGIN
    -- Get caller info
    SELECT id, role, dojo_id INTO caller_profile_id, caller_role, target_dojo_id
    FROM public.profiles
    WHERE user_id = auth.uid() AND deleted_at IS NULL;

    -- Only owners can change roles
    IF caller_role != 'owner' THEN
        RAISE EXCEPTION 'Only owners can change member roles';
    END IF;

    -- Ensure target is in the same dojo
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = target_member_id AND dojo_id = target_dojo_id
    ) THEN
        RAISE EXCEPTION 'Target member not found in your dojo';
    END IF;

    -- Prevent self-role change
    IF target_member_id = caller_profile_id THEN
        RAISE EXCEPTION 'Owners cannot change their own role via this function';
    END IF;

    UPDATE public.profiles
    SET role = new_role
    WHERE id = target_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: promote_member
CREATE OR REPLACE FUNCTION public.promote_member(
    target_member_id uuid,
    new_rank text
)
RETURNS void AS $$
DECLARE
    caller_profile_id uuid;
    caller_role text;
    target_dojo_id uuid;
    old_rank text;
BEGIN
    -- Get caller info
    SELECT id, role, dojo_id INTO caller_profile_id, caller_role, target_dojo_id
    FROM public.profiles
    WHERE user_id = auth.uid() AND deleted_at IS NULL;

    -- Permissions check (Owner or Instructor)
    IF caller_role NOT IN ('owner', 'instructor') THEN
        RAISE EXCEPTION 'Only staff can promote members';
    END IF;

    -- Get target info and verify dojo
    SELECT rank_name INTO old_rank
    FROM public.profiles
    WHERE id = target_member_id AND dojo_id = target_dojo_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target member not found in your dojo';
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET rank_name = new_rank
    WHERE id = target_member_id;

    -- Insert history
    INSERT INTO public.rank_history (
        dojo_id, user_id, previous_rank, new_rank, promoted_by
    ) VALUES (
        target_dojo_id, target_member_id, old_rank, new_rank, caller_profile_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
