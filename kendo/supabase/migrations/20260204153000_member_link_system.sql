-- Drop conflicting table if exists (Re-architecting for Spec 008)
DROP TABLE IF EXISTS link_requests CASCADE;

-- Update profiles table
ALTER TABLE profiles
-- Use birthdate to match existing schema convention (if it exists, skip)
ADD COLUMN IF NOT EXISTS birthdate DATE,
-- guardian_phone might already exist, but ensuring it does
ADD COLUMN IF NOT EXISTS guardian_phone TEXT;

-- Create profile_guardians table
CREATE TABLE IF NOT EXISTS profile_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(profile_id, guardian_id)
);

-- Create link_requests table (New Schema)
CREATE TABLE link_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (Additions)
-- Allow guardians to see profiles they are linked to
CREATE POLICY "Guardians can view linked profiles" ON profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profile_guardians
        WHERE profile_guardians.profile_id = profiles.id
        AND profile_guardians.guardian_id = auth.uid()
    )
);

-- RLS Policies for profile_guardians
CREATE POLICY "Guardians can view own links" ON profile_guardians
FOR SELECT
USING (guardian_id = auth.uid());

CREATE POLICY "Dojo admins can view links for their profiles" ON profile_guardians
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        JOIN dojos ON profiles.dojo_id = dojos.id
        WHERE profiles.id = profile_guardians.profile_id
        AND dojos.owner_id = auth.uid()
    )
);

CREATE POLICY "Admins can delete links" ON profile_guardians
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        JOIN dojos ON profiles.dojo_id = dojos.id
        WHERE profiles.id = profile_guardians.profile_id
        AND dojos.owner_id = auth.uid()
    )
);

CREATE POLICY "Guardians can delete own links" ON profile_guardians
FOR DELETE
USING (guardian_id = auth.uid());

-- RLS Policies for link_requests
CREATE POLICY "Guardians can view own requests" ON link_requests
FOR SELECT
USING (guardian_id = auth.uid());

CREATE POLICY "Dojo admins can view requests for their profiles" ON link_requests
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        JOIN dojos ON profiles.dojo_id = dojos.id
        WHERE profiles.id = link_requests.profile_id
        AND dojos.owner_id = auth.uid()
    )
);

CREATE POLICY "Guardians can create requests" ON link_requests
FOR INSERT
WITH CHECK (guardian_id = auth.uid());

CREATE POLICY "Dojo admins can update requests" ON link_requests
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        JOIN dojos ON profiles.dojo_id = dojos.id
        WHERE profiles.id = link_requests.profile_id
        AND dojos.owner_id = auth.uid()
    )
);

-- RPC: Find Potential Children
CREATE OR REPLACE FUNCTION find_potential_children()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_phone TEXT;
BEGIN
    -- Get phone from auth.users (safer than metadata)
    SELECT phone INTO user_phone FROM auth.users WHERE id = auth.uid();
    
    IF user_phone IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT *
    FROM profiles
    WHERE profiles.guardian_phone = user_phone
    AND NOT EXISTS (
        SELECT 1 FROM profile_guardians
        WHERE profile_guardians.profile_id = profiles.id
        AND profile_guardians.guardian_id = auth.uid()
    );
END;
$$;

-- RPC: Link Child
CREATE OR REPLACE FUNCTION link_child(child_profile_id UUID, relation TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_phone TEXT;
    target_profile profiles%ROWTYPE;
BEGIN
    -- Get phone
    SELECT phone INTO user_phone FROM auth.users WHERE id = auth.uid();
    
    IF user_phone IS NULL THEN
        RAISE EXCEPTION 'Phone number not found for user';
    END IF;

    -- Check if profile exists and phone matches
    SELECT * INTO target_profile
    FROM profiles
    WHERE id = child_profile_id;

    IF target_profile.id IS NULL THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    -- Compare phones (Normalization recommended in production, assuming exact match for now)
    IF target_profile.guardian_phone != user_phone THEN
         RAISE EXCEPTION 'Phone number mismatch';
    END IF;

    -- Insert into profile_guardians
    INSERT INTO profile_guardians (profile_id, guardian_id, relationship, is_primary)
    VALUES (child_profile_id, auth.uid(), relation, false)
    ON CONFLICT (profile_id, guardian_id) DO NOTHING;
END;
$$;