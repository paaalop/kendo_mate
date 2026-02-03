-- Fix RLS policies for payments and user_progress to allow Guardians (Owners) to view their children's data.

-- 1. Fix Payments RLS
DROP POLICY IF EXISTS "member_select_own_payments" ON public.payments;

CREATE POLICY "member_select_own_payments" ON public.payments
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = public.payments.user_id 
        AND (profiles.user_id = auth.uid() OR profiles.owner_id = auth.uid()) -- Allow Guardian
    )
);

-- 2. Fix User Progress RLS
DROP POLICY IF EXISTS "dojo_member_select_progress" ON public.user_progress;

CREATE POLICY "dojo_member_select_progress" ON public.user_progress
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = public.user_progress.user_id
        AND (
            profiles.user_id = auth.uid() 
            OR profiles.owner_id = auth.uid() -- Allow Guardian
            OR is_dojo_staff(profiles.dojo_id)
        )
    )
);
