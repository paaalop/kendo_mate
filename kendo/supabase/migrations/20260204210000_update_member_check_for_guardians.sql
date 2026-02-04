-- Update is_dojo_member to include links via profile_guardians
CREATE OR REPLACE FUNCTION public.is_dojo_member(target_dojo_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        -- 1. Direct membership (User's own profile in the dojo)
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND dojo_id = target_dojo_id
        AND deleted_at IS NULL
    ) OR EXISTS (
        -- 2. Legacy Shadow Ownership
        SELECT 1 FROM public.profiles
        WHERE owner_id = auth.uid()
        AND dojo_id = target_dojo_id
        AND deleted_at IS NULL
    ) OR EXISTS (
        -- 3. New Link System (Guardian of a student in this dojo)
        SELECT 1 FROM public.profile_guardians pg
        JOIN public.profiles p ON pg.profile_id = p.id
        WHERE pg.guardian_id = auth.uid()
        AND p.dojo_id = target_dojo_id
        AND p.deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update is_dojo_staff for completeness (Owners/Instructors)
CREATE OR REPLACE FUNCTION public.is_dojo_staff(target_dojo_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND dojo_id = target_dojo_id
        AND role IN ('owner', 'instructor')
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
