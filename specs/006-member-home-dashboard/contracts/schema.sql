-- Migration plan (conceptual)

ALTER TABLE members 
ADD COLUMN owner_id UUID REFERENCES auth.users(id),
ADD COLUMN is_shadow BOOLEAN DEFAULT false;

CREATE TABLE link_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID REFERENCES auth.users(id) NOT NULL,
  target_dojo_id UUID REFERENCES dojos(id) NOT NULL,
  child_name TEXT NOT NULL,
  child_birthdate DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE link_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guardians can view own requests" ON link_requests
FOR SELECT USING (auth.uid() = guardian_id);

CREATE POLICY "Guardians can create requests" ON link_requests
FOR INSERT WITH CHECK (auth.uid() = guardian_id);

-- RPC: get_next_curriculum
CREATE OR REPLACE FUNCTION get_next_curriculum(p_member_id UUID)
RETURNS SETOF curriculum_items AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM curriculum_items c
  JOIN members m ON m.dojo_id = c.dojo_id
  WHERE m.id = p_member_id
  AND c.id NOT IN (
    SELECT item_id FROM user_progress WHERE user_id = p_member_id
  )
  ORDER BY c.order_index ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
