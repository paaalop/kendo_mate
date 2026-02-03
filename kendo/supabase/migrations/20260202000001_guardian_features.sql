-- Add owner_id, is_shadow, and birthdate to profiles table
ALTER TABLE profiles 
ADD COLUMN owner_id uuid REFERENCES auth.users(id),
ADD COLUMN is_shadow boolean DEFAULT false,
ADD COLUMN birthdate date;

-- Create link_requests table
CREATE TABLE link_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id uuid REFERENCES auth.users(id) NOT NULL,
    target_dojo_id uuid REFERENCES dojos(id) NOT NULL,
    child_name text NOT NULL,
    child_birthdate date NOT NULL,
    request_type text NOT NULL CHECK (request_type IN ('link', 'unlink')) DEFAULT 'link',
    status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on link_requests
ALTER TABLE link_requests ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX idx_profiles_owner_id ON profiles(owner_id);
CREATE INDEX idx_link_requests_guardian_id ON link_requests(guardian_id);
CREATE INDEX idx_link_requests_target_dojo_id ON link_requests(target_dojo_id);
