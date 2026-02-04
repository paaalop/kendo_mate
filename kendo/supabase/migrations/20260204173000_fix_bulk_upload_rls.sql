-- Fix Bulk Upload RLS Error
-- The previous policies only allowed a user to insert their OWN profile (where user_id = auth.uid()).
-- We need to allow Dojo Staff (Owners/Instructors) to insert profiles for members (where user_id is null or different).

-- Add policy to allow Staff to insert profiles into their dojo
CREATE POLICY "staff_insert_profiles" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (
    is_dojo_staff(dojo_id)
);
