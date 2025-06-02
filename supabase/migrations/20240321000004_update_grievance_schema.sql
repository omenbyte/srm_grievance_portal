-- Drop the priority column if it exists
ALTER TABLE grievances DROP COLUMN IF EXISTS priority;

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'grievances' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE grievances ADD COLUMN image_url TEXT;
    END IF;
END $$; 