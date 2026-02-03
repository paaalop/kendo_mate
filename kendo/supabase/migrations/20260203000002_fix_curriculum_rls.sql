-- Fix is_dojo_member function to include Guardians (Owners) of profiles
-- This allows Guardians to view curriculum, attendance, notices, etc. for their children's dojo.

CREATE OR REPLACE FUNCTION public.is_dojo_member(target_dojo_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE (user_id = auth.uid() OR owner_id = auth.uid()) -- Added owner_id check
        AND dojo_id = target_dojo_id
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
