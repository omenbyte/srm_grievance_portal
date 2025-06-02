-- Create admin_phones table
CREATE TABLE IF NOT EXISTS public.admin_phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to get grievance statistics
CREATE OR REPLACE FUNCTION get_grievance_stats()
RETURNS TABLE (
    total_count bigint,
    pending_count bigint,
    resolved_count bigint,
    critical_count bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'In-Progress') as pending,
            COUNT(*) FILTER (WHERE status = 'Completed') as resolved,
            COUNT(*) FILTER (
                WHERE status = 'In-Progress' 
                AND submitted_at < NOW() - INTERVAL '3 days'
            ) as critical
        FROM public.grievances
    )
    SELECT 
        total::bigint,
        pending::bigint,
        resolved::bigint,
        critical::bigint
    FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get paginated grievances
CREATE OR REPLACE FUNCTION get_paginated_grievances(
    p_page_size integer,
    p_page_number integer,
    p_search_query text DEFAULT ''
)
RETURNS TABLE (
    id uuid,
    ticket_number text,
    user_id uuid,
    issue_type issue_type,
    sub_category text,
    message text,
    image_url text,
    submitted_at timestamptz,
    status grievance_status,
    first_name text,
    last_name text,
    phone text,
    reg_number text,
    email text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id,
        g.ticket_number,
        g.user_id,
        g.issue_type,
        g.sub_category,
        g.message,
        g.image_url,
        g.submitted_at,
        g.status,
        u.first_name,
        u.last_name,
        u.phone,
        u.reg_number,
        u.email
    FROM public.grievances g
    JOIN public.users u ON g.user_id = u.id
    WHERE 
        p_search_query = '' OR
        g.ticket_number ILIKE '%' || p_search_query || '%' OR
        u.first_name ILIKE '%' || p_search_query || '%' OR
        u.last_name ILIKE '%' || p_search_query || '%' OR
        u.reg_number ILIKE '%' || p_search_query || '%' OR
        g.issue_type::text ILIKE '%' || p_search_query || '%' OR
        g.message ILIKE '%' || p_search_query || '%'
    ORDER BY g.submitted_at DESC
    LIMIT p_page_size
    OFFSET (p_page_number - 1) * p_page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update grievance status
CREATE OR REPLACE FUNCTION update_grievance_status(
    p_grievance_id uuid,
    p_new_status grievance_status
)
RETURNS boolean AS $$
BEGIN
    UPDATE public.grievances
    SET status = p_new_status
    WHERE id = p_grievance_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_grievance_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_paginated_grievances(integer, integer, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_grievance_status(uuid, grievance_status) TO anon, authenticated; 