-- 20260202000000_owner_admin_schema.sql

-- 0. Extensions & Helper Functions
create extension if not exists moddatetime with schema extensions;

create or replace function public.is_dojo_owner(target_dojo_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 
    from public.dojos 
    where id = target_dojo_id 
    and owner_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

grant execute on function public.is_dojo_owner(uuid) to authenticated;


-- 1. Payments Table Updates
do $$
begin
  -- Convert target_month from text to date if needed
  if exists (select 1 from information_schema.columns where table_name = 'payments' and column_name = 'target_month' and data_type = 'text') then
    alter table public.payments alter column target_month type date using to_date(target_month, 'YYYY-MM');
  end if;

  -- Rename payment_date to paid_at if it exists
  if exists (select 1 from information_schema.columns where table_name = 'payments' and column_name = 'payment_date') then
    alter table public.payments rename column payment_date to paid_at;
  end if;
end $$;

-- Add/Alter columns for payments
alter table public.payments 
  add column if not exists updated_at timestamptz not null default now(),
  alter column amount set default 0,
  alter column amount drop not null;

-- Update foreign key for user_id to cascade
alter table public.payments drop constraint if exists payments_user_id_fkey;
alter table public.payments add constraint payments_user_id_fkey 
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- Update Unique Constraint for payments
alter table public.payments drop constraint if exists payments_user_id_target_month_key;
alter table public.payments drop constraint if exists payments_dojo_id_user_id_target_month_key;
alter table public.payments add constraint payments_dojo_id_user_id_target_month_key 
  unique (dojo_id, user_id, target_month);


-- 2. Sessions Table (New)
create table if not exists public.sessions (
  id uuid not null default gen_random_uuid(),
  dojo_id uuid not null references public.dojos(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  primary key (id)
);

alter table public.sessions enable row level security;


-- 3. Curriculum Items Table Updates
alter table public.curriculum_items 
  add column if not exists description text;

-- Fix duplicates in curriculum_items before adding constraint
with ordered as (
  select id, row_number() over (partition by dojo_id order by order_index, created_at) as new_rank
  from public.curriculum_items
)
update public.curriculum_items
set order_index = ordered.new_rank
from ordered
where public.curriculum_items.id = ordered.id;

-- Add unique constraint for curriculum_items
alter table public.curriculum_items drop constraint if exists curriculum_items_dojo_id_order_index_key;
alter table public.curriculum_items add constraint curriculum_items_dojo_id_order_index_key 
  unique (dojo_id, order_index);

alter table public.curriculum_items enable row level security;


-- 4. RLS Policies

-- Drop existing conflicting policies
drop policy if exists "Restricted access for payments" on public.payments;
drop policy if exists "Owners can manage payments" on public.payments;
drop policy if exists "Members can view own payments" on public.payments;
drop policy if exists "staff_select_all_payments" on public.payments;
drop policy if exists "member_select_own_payments" on public.payments;
drop policy if exists "staff_modify_payments" on public.payments;
drop policy if exists "Public Access" on public.payments;

-- Payments
create policy "Owners can manage payments"
  on public.payments
  for all
  to authenticated
  using ( is_dojo_owner(dojo_id) );

create policy "Members can view own payments"
  on public.payments
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = payments.user_id
      and user_id = auth.uid()
    )
  );

-- Sessions
drop policy if exists "Everyone can view sessions" on public.sessions;
drop policy if exists "Owners can manage sessions" on public.sessions;

create policy "Everyone can view sessions"
  on public.sessions
  for select
  to authenticated
  using ( true );

create policy "Owners can manage sessions"
  on public.sessions
  for all
  to authenticated
  using ( is_dojo_owner(dojo_id) );

-- Curriculum
drop policy if exists "Everyone can view curriculum" on public.curriculum_items;
drop policy if exists "Owners can manage curriculum" on public.curriculum_items;

create policy "Everyone can view curriculum"
  on public.curriculum_items
  for select
  to authenticated
  using ( true );

create policy "Owners can manage curriculum"
  on public.curriculum_items
  for all
  to authenticated
  using ( is_dojo_owner(dojo_id) );

-- 5. Triggers
drop trigger if exists handle_updated_at on public.payments;
create trigger handle_updated_at before update on public.payments
  for each row execute procedure extensions.moddatetime (updated_at);

-- 6. RPC Functions

-- generate_monthly_payments
create or replace function public.generate_monthly_payments(
  target_date date
)
returns void as $$
begin
  -- Insert for all active members (deleted_at is null)
  insert into public.payments (dojo_id, user_id, target_month, amount)
  select 
    dojo_id,
    id as user_id,
    target_date,
    0 -- Default amount
  from public.profiles
  where deleted_at is null
  and dojo_id is not null
  and not exists (
    select 1 from public.payments p 
    where p.dojo_id = profiles.dojo_id 
    and p.user_id = profiles.id 
    and p.target_month = target_date
  );
end;
$$ language plpgsql security definer;

-- reorder_curriculum_item
create or replace function public.reorder_curriculum_item(
  target_item_id uuid,
  new_index integer
)
returns void as $$
declare
  target_dojo_id uuid;
  old_index integer;
begin
  select dojo_id, order_index into target_dojo_id, old_index
  from public.curriculum_items
  where id = target_item_id;

  if not found then
    raise exception 'Item not found';
  end if;

  if not is_dojo_owner(target_dojo_id) then
    raise exception 'Not authorized';
  end if;

  if old_index = new_index then
    return;
  end if;

  if old_index < new_index then
    update public.curriculum_items
    set order_index = order_index - 1
    where dojo_id = target_dojo_id
    and order_index > old_index
    and order_index <= new_index;
  else
    update public.curriculum_items
    set order_index = order_index + 1
    where dojo_id = target_dojo_id
    and order_index >= new_index
    and order_index < old_index;
  end if;

  update public.curriculum_items
  set order_index = new_index
  where id = target_item_id;

end;
$$ language plpgsql security definer;
