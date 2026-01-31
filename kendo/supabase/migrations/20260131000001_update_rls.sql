-- 1. Drop old permissive policies
DROP POLICY IF EXISTS "Enable all access for dojos" ON public.dojos;
DROP POLICY IF EXISTS "Enable all access for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for signup_requests" ON public.signup_requests;

-- 2. Dojos
-- SELECT: Anyone authenticated can search for dojos
CREATE POLICY "authenticated_select_dojos" ON public.dojos
FOR SELECT TO authenticated USING (true);

-- INSERT: Anyone authenticated can create a dojo
CREATE POLICY "authenticated_insert_dojos" ON public.dojos
FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

-- UPDATE/DELETE: Only owner can modify
CREATE POLICY "owner_modify_dojos" ON public.dojos
FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- 3. Profiles
-- SELECT: Members can see other members in the SAME dojo, or own profile
CREATE POLICY "dojo_member_select_profiles" ON public.profiles
FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.profiles AS my_profile
        WHERE my_profile.user_id = auth.uid()
        AND my_profile.dojo_id = public.profiles.dojo_id
        AND my_profile.deleted_at IS NULL
    )
);

-- INSERT: User can create their own profile
CREATE POLICY "user_insert_own_profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- UPDATE: Staff can update anyone in dojo. Self can update certain fields.
CREATE POLICY "staff_or_self_update_profiles" ON public.profiles
FOR UPDATE TO authenticated USING (
    (user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.profiles AS staff_profile
        WHERE staff_profile.user_id = auth.uid() 
        AND staff_profile.dojo_id = public.profiles.dojo_id 
        AND staff_profile.role IN ('owner', 'instructor')
        AND staff_profile.deleted_at IS NULL
    )
);

-- 4. Signup Requests
-- SELECT: Staff can see requests for their dojo. Users can see their own.
CREATE POLICY "staff_or_self_select_requests" ON public.signup_requests
FOR SELECT TO authenticated USING (
    (user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.profiles AS staff_profile
        WHERE staff_profile.user_id = auth.uid() 
        AND staff_profile.dojo_id = public.signup_requests.dojo_id 
        AND staff_profile.role IN ('owner', 'instructor')
        AND staff_profile.deleted_at IS NULL
    )
);

-- INSERT: Anyone authenticated
CREATE POLICY "authenticated_insert_requests" ON public.signup_requests
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- UPDATE/DELETE: Staff can update status. Self can cancel (delete).
CREATE POLICY "staff_or_self_modify_requests" ON public.signup_requests
FOR ALL TO authenticated USING (
    (user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.profiles AS staff_profile
        WHERE staff_profile.user_id = auth.uid() 
        AND staff_profile.dojo_id = public.signup_requests.dojo_id 
        AND staff_profile.role IN ('owner', 'instructor')
        AND staff_profile.deleted_at IS NULL
    )
);
