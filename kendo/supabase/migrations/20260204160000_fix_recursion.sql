-- Fix recursion by moving Admin check to Security Definer function

-- 1. Create the helper function
CREATE OR REPLACE FUNCTION is_dojo_admin_for_profile(target_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is the owner of the dojo that the profile belongs to
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    JOIN dojos ON profiles.dojo_id = dojos.id
    WHERE profiles.id = target_profile_id
    AND dojos.owner_id = auth.uid()
  );
END;
$$;

-- 2. Update profile_guardians policies
DROP POLICY "Dojo admins can view links for their profiles" ON profile_guardians;
CREATE POLICY "Dojo admins can view links for their profiles" ON profile_guardians
FOR SELECT
USING ( is_dojo_admin_for_profile(profile_id) );

DROP POLICY "Admins can delete links" ON profile_guardians;
CREATE POLICY "Admins can delete links" ON profile_guardians
FOR DELETE
USING ( is_dojo_admin_for_profile(profile_id) );

-- 3. Update link_requests policies (Preventative, though maybe not strictly recursing yet)
DROP POLICY "Dojo admins can view requests for their profiles" ON link_requests;
CREATE POLICY "Dojo admins can view requests for their profiles" ON link_requests
FOR SELECT
USING ( is_dojo_admin_for_profile(profile_id) );

DROP POLICY "Dojo admins can update requests" ON link_requests;
CREATE POLICY "Dojo admins can update requests" ON link_requests
FOR UPDATE
USING ( is_dojo_admin_for_profile(profile_id) );
