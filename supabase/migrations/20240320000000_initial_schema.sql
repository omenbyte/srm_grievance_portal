-- Create enum for grievance status
CREATE TYPE grievance_status AS ENUM ('Completed', 'In-Progress', 'Rejected');

-- Create enum for issue types
CREATE TYPE issue_type AS ENUM ('Classroom', 'Hostel', 'Academic', 'Bus', 'Facilities', 'Others');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    reg_number TEXT CHECK (length(reg_number) BETWEEN 12 AND 15),
    email TEXT CHECK (email LIKE '%@srmist.edu.in'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grievances table
CREATE TABLE grievances (
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

-- Create policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own grievances" ON grievances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grievances" ON grievances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

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