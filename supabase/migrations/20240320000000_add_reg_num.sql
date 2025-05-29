-- Add registration number column to users table
ALTER TABLE users
ADD COLUMN reg_num VARCHAR(15);

-- Add comment to explain the column
COMMENT ON COLUMN users.reg_num IS 'Student registration number (12-15 characters)'; 