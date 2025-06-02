-- First, create a new enum type with the updated values
CREATE TYPE issue_type_new AS ENUM (
    'Classroom',
    'Administration',
    'Academic',
    'Accounts',
    'Transport',
    'Hostel',
    'Laboratory'
);

-- Update the column to use the new type
ALTER TABLE grievances 
    ALTER COLUMN issue_type TYPE issue_type_new 
    USING issue_type::text::issue_type_new;

-- Drop the old enum type
DROP TYPE issue_type; 