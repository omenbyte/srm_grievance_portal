-- Create enum for grievance status
CREATE TYPE grievance_status AS ENUM ('Completed', 'In-Progress', 'Rejected');

-- Create enum for issue types
CREATE TYPE issue_type AS ENUM ('Classroom', 'Hostel', 'Academic', 'Bus', 'Facilities', 'Others');

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.grievances;
DROP TABLE IF EXISTS public.users;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    reg_number TEXT CHECK (length(reg_number) BETWEEN 12 AND 15 OR reg_number = ''),
    email TEXT CHECK (email IS NULL OR email = '' OR email LIKE '%@srmist.edu.in'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grievances table
CREATE TABLE public.grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_type issue_type NOT NULL,
    sub_category TEXT NOT NULL,
    message TEXT NOT NULL CHECK (length(message) <= 355),
    image_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status grievance_status NOT NULL DEFAULT 'In-Progress'
);

-- Create indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_grievances_user_id ON grievances(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own grievances" ON grievances;
DROP POLICY IF EXISTS "Users can insert their own grievances" ON grievances;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

-- Create new policies
CREATE POLICY "Enable insert for all users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on phone" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all grievances" ON grievances
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all grievances" ON grievances
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.grievances TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Create function to handle JWT expiration
CREATE OR REPLACE FUNCTION handle_jwt_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.exp < extract(epoch from now()) + 1800 THEN -- 30 minutes
        NEW.exp = extract(epoch from now()) + 1800;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for JWT expiration
CREATE TRIGGER set_jwt_expiration
    BEFORE INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_jwt_expiration(); 