-- First, drop the existing tables and types
DROP TABLE IF EXISTS public.grievances;
DROP TABLE IF EXISTS public.users;
DROP TYPE IF EXISTS grievance_status;
DROP TYPE IF EXISTS issue_type;

-- Create the enums
CREATE TYPE grievance_status AS ENUM ('pending', 'in-progress', 'completed');
CREATE TYPE issue_type AS ENUM (
    'Classroom',
    'Administration',
    'Academic',
    'Accounts',
    'Transport',
    'Hostel',
    'Laboratory'
);

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
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_type issue_type NOT NULL,
    sub_category TEXT NOT NULL,
    location_details TEXT,
    message TEXT NOT NULL CHECK (length(message) <= 355),
    image_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status grievance_status NOT NULL DEFAULT 'pending'
);

-- Create indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_grievances_user_id ON grievances(user_id);
CREATE INDEX idx_grievances_ticket_number ON grievances(ticket_number);
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_submitted_at ON grievances(submitted_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_grievances_updated_at
    BEFORE UPDATE ON grievances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Grant permissions
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.grievances TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated; 