-- Drop the existing constraint if it exists
ALTER TABLE organizations 
DROP CONSTRAINT IF EXISTS organizations_auth_id_fkey;

-- Add auth_id column properly referencing auth.users
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS organizations_auth_id_idx ON organizations(auth_id); 