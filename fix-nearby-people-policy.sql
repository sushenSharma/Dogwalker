-- Fix for "People Within 10km" feature showing "0 people checked in nearby"
-- This adds a policy to allow viewing all public check-ins for discovery purposes

-- Add policy to allow viewing all public check-ins (for nearby people discovery)
DROP POLICY IF EXISTS "Users can view all public check-ins" ON check_ins;
CREATE POLICY "Users can view all public check-ins" ON check_ins
  FOR SELECT USING (is_public = true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'check_ins';