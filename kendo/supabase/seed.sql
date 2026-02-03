-- Create extension for hashing
create extension if not exists "pgcrypto";

-- Create Admin User
-- User ID: 00000000-0000-0000-0000-000000000001
-- Email: admin@kendo.com
-- Password: password123
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@kendo.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Identity for Admin
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@kendo.com"}',
    'email',
    '00000000-0000-0000-0000-000000000001',
    now(),
    now(),
    now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Create Dojo
INSERT INTO public.dojos (id, name, owner_id, default_fee)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Seoul Kendo Dojo', '00000000-0000-0000-0000-000000000001', 150000)
ON CONFLICT (id) DO NOTHING;

-- Create Admin Profile
INSERT INTO public.profiles (id, user_id, dojo_id, role, name, phone, rank_level, rank_name, is_adult)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner', 'Admin Master', '010-1234-5678', 5, '5단', true)
ON CONFLICT (id) DO NOTHING;

-- Create Curriculum
INSERT INTO public.curriculum_items (id, dojo_id, title, category, order_index, required_rank_level)
VALUES
('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Basic Stance', 'basic', 1, 0),
('c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Forward Step', 'basic', 2, 0),
('c3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Head Strike', 'technique', 3, 1)
ON CONFLICT (id) DO NOTHING;