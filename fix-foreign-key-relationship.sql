-- Fix the foreign key relationship between check_ins and profiles
-- This will allow the Supabase query to join check_ins with profiles

-- The issue is that both tables reference auth.users(id) but there's no direct 
-- foreign key relationship between check_ins.user_id and profiles.id

-- Since both already reference auth.users(id), we don't need to add a new foreign key
-- Instead, we need to ensure Supabase understands the relationship

-- First, let's verify the current table structure
\d check_ins;
\d profiles;

-- Check current foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('check_ins', 'profiles');

-- The relationship exists through auth.users, but we need to help Supabase understand it
-- Let's create a view that makes the relationship explicit for the query

-- Alternative: Use a simpler query approach that doesn't rely on automatic joins
-- This is what we'll implement in the code instead