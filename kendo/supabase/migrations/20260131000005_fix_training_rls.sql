-- Fix missing RLS policies for user_progress and attendance_logs

-- 1. user_progress policies
-- SELECT: Dojo members can see their own progress, staff can see everyone's in the dojo
-- Note: user_progress.user_id references profiles.id
CREATE POLICY "dojo_member_select_progress" ON public.user_progress
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = public.user_progress.user_id
        AND (profiles.user_id = auth.uid() OR is_dojo_staff(profiles.dojo_id))
    )
);

CREATE POLICY "dojo_staff_modify_progress" ON public.user_progress
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = public.user_progress.user_id
        AND is_dojo_staff(profiles.dojo_id)
    )
);

-- 2. attendance_logs policies (Expand to allow DELETE and UPDATE for staff)
-- Existing policy was only for INSERT
DROP POLICY IF EXISTS "dojo_staff_insert_attendance" ON public.attendance_logs;

CREATE POLICY "dojo_staff_all_attendance" ON public.attendance_logs
FOR ALL TO authenticated USING (is_dojo_staff(dojo_id));

-- Also allow members to see their own logs (already covered by dojo_member_select_attendance if we want them to see everyone's, 
-- but usually they should at least see their own)
-- Existing: CREATE POLICY "dojo_member_select_attendance" ON public.attendance_logs FOR SELECT TO authenticated USING (is_dojo_member(dojo_id));
-- This is fine.
