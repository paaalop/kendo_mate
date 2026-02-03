-- 1. Fix ambiguous column reference in get_next_curriculum
CREATE OR REPLACE FUNCTION get_next_curriculum(member_uuid uuid)
RETURNS TABLE (
    id uuid,
    title text,
    category text,
    order_index integer,
    required_rank_level integer
) AS $$
DECLARE
    target_dojo_id uuid;
BEGIN
    -- Get dojo_id of the member
    -- Qualify profiles.id to avoid ambiguity with return column 'id'
    SELECT dojo_id INTO target_dojo_id
    FROM profiles
    WHERE profiles.id = member_uuid;

    IF target_dojo_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        ci.id,
        ci.title,
        ci.category,
        ci.order_index,
        ci.required_rank_level
    FROM curriculum_items ci
    WHERE ci.dojo_id = target_dojo_id
    AND ci.id NOT IN (
        SELECT up.item_id 
        FROM user_progress up 
        WHERE up.user_id = member_uuid
    )
    ORDER BY ci.order_index ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add RLS policy for guardians to create shadow profiles
CREATE POLICY "guardian_insert_shadow_profile" ON public.profiles
FOR INSERT TO authenticated 
WITH CHECK (
    auth.uid() = owner_id 
    AND is_shadow = true
    AND user_id IS NULL
);
