-- Fix infinite recursion in profiles RLS policies

-- 1. Create helper functions with SECURITY DEFINER to bypass RLS
-- We use SECURITY DEFINER and SET search_path to ensure security and bypass RLS
CREATE OR REPLACE FUNCTION public.is_dojo_member(target_dojo_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND dojo_id = target_dojo_id
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_dojo_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_dojo_staff(uuid) TO authenticated;

-- 2. Drop problematic policies
DROP POLICY IF EXISTS "dojo_member_select_profiles" ON public.profiles;
DROP POLICY IF EXISTS "staff_or_self_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "staff_or_self_select_requests" ON public.signup_requests;
DROP POLICY IF EXISTS "staff_or_self_modify_requests" ON public.signup_requests;

-- 3. Recreate policies using helper functions

-- Profiles SELECT: Own profile OR member of the same dojo
CREATE POLICY "dojo_member_select_profiles" ON public.profiles
FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR
    is_dojo_member(dojo_id)
);

-- Profiles UPDATE: Own profile OR staff of the same dojo
CREATE POLICY "staff_or_self_update_profiles" ON public.profiles
FOR UPDATE TO authenticated USING (
    user_id = auth.uid()
    OR
    is_dojo_staff(dojo_id)
);

-- Signup Requests SELECT: Own request OR staff of the same dojo
CREATE POLICY "staff_or_self_select_requests" ON public.signup_requests
FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR
    is_dojo_staff(dojo_id)
);

-- Signup Requests ALL (UPDATE/DELETE): Own request OR staff of the same dojo
CREATE POLICY "staff_or_self_modify_requests" ON public.signup_requests
FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR
    is_dojo_staff(dojo_id)
);
