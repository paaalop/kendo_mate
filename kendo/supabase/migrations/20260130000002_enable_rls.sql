-- Enable RLS on all tables
alter table public.dojos enable row level security;
alter table public.profiles enable row level security;
alter table public.signup_requests enable row level security;
alter table public.curriculum_items enable row level security;
alter table public.user_progress enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.payments enable row level security;
alter table public.notices enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Permissive policy (True) for all except payments
create policy "Enable all access for dojos" on public.dojos for all using (true) with check (true);
create policy "Enable all access for profiles" on public.profiles for all using (true) with check (true);
create policy "Enable all access for signup_requests" on public.signup_requests for all using (true) with check (true);
create policy "Enable all access for curriculum_items" on public.curriculum_items for all using (true) with check (true);
create policy "Enable all access for user_progress" on public.user_progress for all using (true) with check (true);
create policy "Enable all access for attendance_logs" on public.attendance_logs for all using (true) with check (true);
create policy "Enable all access for notices" on public.notices for all using (true) with check (true);
create policy "Enable all access for posts" on public.posts for all using (true) with check (true);
create policy "Enable all access for comments" on public.comments for all using (true) with check (true);

-- Restricted policy for payments (Deny instructor)
-- Allow access if user has a profile and role is NOT 'instructor'
create policy "Restricted access for payments" on public.payments
for all
using (
  exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role != 'instructor'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role != 'instructor'
  )
);

-- Public read policy for images bucket
create policy "Public Access to images"
on storage.objects for select
using ( bucket_id = 'images' );
