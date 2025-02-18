-- Verify auth_id column
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_name = 'volunteers' 
    AND column_name = 'auth_id';

-- Verify index
SELECT 
    indexname, 
    indexdef 
FROM 
    pg_indexes 
WHERE 
    tablename = 'volunteers' 
    AND indexname = 'volunteers_auth_id_idx';

-- Verify foreign key constraint
SELECT 
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'volunteers'
    AND kcu.column_name = 'auth_id'; 