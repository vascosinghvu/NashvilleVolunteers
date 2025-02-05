-- Check if the volunteers table exists and its current structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'volunteers'
ORDER BY 
    ordinal_position;

-- Check if auth_id column already exists
SELECT 
    column_name 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'volunteers' 
    AND column_name = 'auth_id';

-- Check existing indexes on the volunteers table
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'volunteers'; 