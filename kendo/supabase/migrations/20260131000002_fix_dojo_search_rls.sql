-- Allow all authenticated users to see owner profiles so they can search for dojos
CREATE POLICY "anyone_can_see_owners" ON public.profiles
FOR SELECT TO authenticated USING (
    role = 'owner' AND deleted_at IS NULL
);
