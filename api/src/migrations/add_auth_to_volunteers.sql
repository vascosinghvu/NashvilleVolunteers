-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
BEGIN
    -- Check if auth_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'volunteers' 
        AND column_name = 'auth_id'
    ) THEN
        -- Add auth_id column to volunteers table
        ALTER TABLE volunteers 
        ADD COLUMN auth_id UUID;
        
        -- Create a unique index on auth_id
        CREATE UNIQUE INDEX IF NOT EXISTS volunteers_auth_id_idx ON volunteers(auth_id);
        
        -- Add foreign key constraint to link with auth.users
        ALTER TABLE volunteers
        ADD CONSTRAINT fk_auth_user
        FOREIGN KEY (auth_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$; 