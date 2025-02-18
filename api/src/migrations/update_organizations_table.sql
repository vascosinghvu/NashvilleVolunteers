-- Add phone and auth_id columns to organizations table
DO $$ 
BEGIN
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'organizations' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE organizations
        ADD COLUMN phone VARCHAR(15);
    END IF;

    -- Add auth_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'organizations' 
        AND column_name = 'auth_id'
    ) THEN
        ALTER TABLE organizations
        ADD COLUMN auth_id UUID,
        ADD CONSTRAINT fk_auth_user
        FOREIGN KEY (auth_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$; 