-- T005: RLS Policies for Guardian Features

-- 1. Policies for profiles (members)
-- Allow guardians to view their shadow/linked profiles
CREATE POLICY "guardian_view_members" ON profiles
FOR SELECT
TO authenticated
USING (
    owner_id = auth.uid()
);

-- Allow guardians to update ONLY their shadow profiles (not linked/promoted ones ideally, but 'is_shadow' flag handles this?)
-- Spec says "Update if owner_id = auth.uid() AND is_shadow = true"
CREATE POLICY "guardian_update_shadow" ON profiles
FOR UPDATE
TO authenticated
USING (
    owner_id = auth.uid() 
    AND is_shadow = true
);

-- 2. Policies for link_requests
-- Allow any authenticated user to create a request
CREATE POLICY "guardian_create_link_request" ON link_requests
FOR INSERT
TO authenticated
WITH CHECK (
    guardian_id = auth.uid()
);

-- Allow guardians to view their own requests
CREATE POLICY "guardian_view_link_requests" ON link_requests
FOR SELECT
TO authenticated
USING (
    guardian_id = auth.uid()
);

-- Allow Dojo Staff to view requests for their dojo
CREATE POLICY "staff_view_link_requests" ON link_requests
FOR SELECT
TO authenticated
USING (
    is_dojo_staff(target_dojo_id)
);

-- Allow Dojo Staff to update requests (approve/reject)
CREATE POLICY "staff_update_link_requests" ON link_requests
FOR UPDATE
TO authenticated
USING (
    is_dojo_staff(target_dojo_id)
);
