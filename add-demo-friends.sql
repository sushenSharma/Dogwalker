-- Add demo friend relationships for testing
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users table

-- First, let's see your user ID (run this first)
SELECT id, email FROM auth.users LIMIT 5;

-- Create some demo users/profiles (you can skip this if you want to use existing users)
-- INSERT INTO auth.users (id, email) VALUES 
-- ('11111111-1111-1111-1111-111111111111', 'demo1@example.com'),
-- ('22222222-2222-2222-2222-222222222222', 'demo2@example.com');

-- Create demo profiles (replace UUIDs with real user IDs)
-- INSERT INTO profiles (id, username, full_name, dog_name) VALUES 
-- ('11111111-1111-1111-1111-111111111111', 'sarah_walker', 'Sarah Johnson', 'Buddy'),
-- ('22222222-2222-2222-2222-222222222222', 'mike_paws', 'Mike Chen', 'Luna');

-- Add friend relationships (replace 'YOUR_USER_ID' with your actual user ID)
-- INSERT INTO friends (user_id, friend_id, status) VALUES 
-- ('YOUR_USER_ID', '11111111-1111-1111-1111-111111111111', 'accepted'),
-- ('YOUR_USER_ID', '22222222-2222-2222-2222-222222222222', 'accepted');

-- Add some demo check-ins from friends
-- INSERT INTO check_ins (user_id, location_name, location_type, latitude, longitude, notes, is_public) VALUES
-- ('11111111-1111-1111-1111-111111111111', 'Central Park Dog Run', 'park', 40.785091, -73.968285, 'Great place for dogs to play!', true),
-- ('22222222-2222-2222-2222-222222222222', 'Starbucks on Main St', 'poi', 40.758896, -73.985130, 'Dog-friendly patio', true);