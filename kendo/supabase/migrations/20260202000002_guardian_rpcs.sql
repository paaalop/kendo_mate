-- T002: get_guardian_summary (Updated with link status)
CREATE OR REPLACE FUNCTION get_guardian_summary(guardian_uuid uuid)
RETURNS TABLE (
    member_id uuid,
    name text,
    dojo_name text,
    last_attendance_date timestamptz,
    unpaid_count bigint,
    unpaid_amount bigint,
    link_status text,
    link_request_type text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS member_id,
        p.name,
        d.name AS dojo_name,
        (
            SELECT MAX(al.attended_at)
            FROM attendance_logs al
            WHERE al.user_id = p.id
        ) AS last_attendance_date,
        (
            SELECT COUNT(*)
            FROM payments py
            WHERE py.user_id = p.id AND py.status = 'unpaid'
        ) AS unpaid_count,
        (
            SELECT COALESCE(SUM(py.amount), 0)
            FROM payments py
            WHERE py.user_id = p.id AND py.status = 'unpaid'
        ) AS unpaid_amount,
        lr.status AS link_status,
        lr.request_type AS link_request_type
    FROM profiles p
    LEFT JOIN dojos d ON p.dojo_id = d.id
    LEFT JOIN LATERAL (
        SELECT status, request_type
        FROM link_requests
        WHERE guardian_id = guardian_uuid 
        AND (
            (request_type = 'link' AND child_name = p.name) -- Matches shadow profiles during linking
            OR 
            (request_type = 'unlink' AND target_dojo_id = p.dojo_id AND child_name = p.name) -- Matches linked profiles during unlinking
        )
        ORDER BY created_at DESC
        LIMIT 1
    ) lr ON TRUE
    WHERE p.owner_id = guardian_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- T003: get_next_curriculum
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
    SELECT dojo_id INTO target_dojo_id
    FROM profiles
    WHERE id = member_uuid;

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_guardian_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_curriculum(uuid) TO authenticated;
    