-- Create dojos table
create table public.dojos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  default_fee integer default 150000,
  trial_ends_at timestamp with time zone default (now() + interval '14 days'),
  created_at timestamp with time zone default now()
);

-- Create profiles table
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  dojo_id uuid references public.dojos(id),
  role text default 'member' check (role in ('owner', 'instructor', 'member', 'guardian')),
  name text not null,
  phone text,
  rank_level integer default 0,
  rank_name text default '무급',
  default_session_time text,
  is_adult boolean default false,
  guardian_name text,
  guardian_phone text,
  created_at timestamp with time zone default now(),
  unique (dojo_id, phone)
);

create index profiles_phone_idx on public.profiles (phone);
create index profiles_guardian_phone_idx on public.profiles (guardian_phone);

-- Create signup_requests table
create table public.signup_requests (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid references public.dojos(id),
  user_id uuid references auth.users(id),
  name text not null,
  phone text,
  guardian_phone text,
  is_adult boolean default false,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now()
);

-- Create curriculum_items table
create table public.curriculum_items (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid references public.dojos(id),
  title text not null,
  category text check (category in ('basic', 'technique', 'sparring')),
  order_index integer not null,
  required_rank_level integer,
  created_at timestamp with time zone default now()
);

-- Create user_progress table
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  item_id uuid references public.curriculum_items(id),
  status text default 'completed',
  completed_at timestamp with time zone default now(),
  unique (user_id, item_id)
);

-- Create attendance_logs table
create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid references public.dojos(id),
  user_id uuid references public.profiles(id),
  attended_at timestamp with time zone default now(),
  check_type text default 'manual' check (check_type in ('manual', 'qr', 'face')),
  created_at timestamp with time zone default now()
);

-- Create payments table
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid references public.dojos(id),
  user_id uuid references public.profiles(id) on delete set null,
  target_month text not null, -- Format 'YYYY-MM'
  amount integer not null,
  payment_date timestamp with time zone,
  status text default 'unpaid' check (status in ('unpaid', 'pending', 'paid')),
  created_at timestamp with time zone default now(),
  unique (user_id, target_month)
);

-- Create notices table
create table public.notices (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid references public.dojos(id),
  author_id uuid references public.profiles(id),
  title text not null,
  content text not null,
  is_pinned boolean default false,
  created_at timestamp with time zone default now()
);

-- Create posts table
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid references public.dojos(id),
  author_id uuid references public.profiles(id),
  category text default 'free' check (category in ('free', 'qna', 'cert')),
  title text not null,
  content text not null,
  image_url text,
  view_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Create comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id),
  content text not null,
  created_at timestamp with time zone default now()
);

-- Create images bucket
insert into storage.buckets (id, name, public)
values ('images', 'images', true);
