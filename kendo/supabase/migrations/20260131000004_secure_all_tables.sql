-- Secure all other tables with Dojo-based RLS

-- 1. Drop existing permissive policies
DROP POLICY IF EXISTS "Enable all access for curriculum_items" ON public.curriculum_items;
DROP POLICY IF EXISTS "Enable all access for user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Enable all access for attendance_logs" ON public.attendance_logs;
DROP POLICY IF EXISTS "Enable all access for notices" ON public.notices;
DROP POLICY IF EXISTS "Enable all access for posts" ON public.posts;
DROP POLICY IF EXISTS "Enable all access for comments" ON public.comments;
DROP POLICY IF EXISTS "Restricted access for payments" ON public.payments;

-- 2. Curriculum Items (Read: Dojo members, Write: Staff)
CREATE POLICY "dojo_member_select_curriculum" ON public.curriculum_items
FOR SELECT TO authenticated USING (is_dojo_member(dojo_id));

CREATE POLICY "dojo_staff_modify_curriculum" ON public.curriculum_items
FOR ALL TO authenticated USING (is_dojo_staff(dojo_id));

-- 3. Attendance Logs (Read: Dojo members, Write: Staff)
CREATE POLICY "dojo_member_select_attendance" ON public.attendance_logs
FOR SELECT TO authenticated USING (is_dojo_member(dojo_id));

CREATE POLICY "dojo_staff_insert_attendance" ON public.attendance_logs
FOR INSERT TO authenticated WITH CHECK (is_dojo_staff(dojo_id));

-- 4. Payments (Read/Write: Staff only, Self can read own)
-- Note: payments table has user_id which references profiles.id
CREATE POLICY "staff_select_all_payments" ON public.payments
FOR SELECT TO authenticated USING (is_dojo_staff(dojo_id));

CREATE POLICY "member_select_own_payments" ON public.payments
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = public.payments.user_id 
        AND profiles.user_id = auth.uid()
    )
);

CREATE POLICY "staff_modify_payments" ON public.payments
FOR ALL TO authenticated USING (is_dojo_staff(dojo_id));

-- 5. Notices (Read: Dojo members, Write: Staff)
CREATE POLICY "dojo_member_select_notices" ON public.notices
FOR SELECT TO authenticated USING (is_dojo_member(dojo_id));

CREATE POLICY "dojo_staff_modify_notices" ON public.notices
FOR ALL TO authenticated USING (is_dojo_staff(dojo_id));

-- 6. Posts (Read: Dojo members, Write: Dojo members)
CREATE POLICY "dojo_member_select_posts" ON public.posts
FOR SELECT TO authenticated USING (is_dojo_member(dojo_id));

CREATE POLICY "dojo_member_insert_posts" ON public.posts
FOR INSERT TO authenticated WITH CHECK (is_dojo_member(dojo_id));

CREATE POLICY "author_or_staff_modify_posts" ON public.posts
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = public.posts.author_id 
        AND profiles.user_id = auth.uid()
    )
    OR is_dojo_staff(dojo_id)
);

-- 7. Comments (Read: Dojo members, Write: Dojo members)
-- Comments don't have dojo_id, so we join through posts
CREATE POLICY "dojo_member_select_comments" ON public.comments
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.posts
        WHERE posts.id = public.comments.post_id
        AND is_dojo_member(posts.dojo_id)
    )
);

CREATE POLICY "dojo_member_insert_comments" ON public.comments
FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.posts
        WHERE posts.id = public.comments.post_id
        AND is_dojo_member(posts.dojo_id)
    )
);

CREATE POLICY "author_or_staff_modify_comments" ON public.comments
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = public.comments.author_id 
        AND profiles.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.posts
        WHERE posts.id = public.comments.post_id
        AND is_dojo_staff(posts.dojo_id)
    )
);
