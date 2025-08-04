-- Add activities table for notifications/activity feed
-- Run this script separately since existing tables already exist

-- Create activities table for notifications/activity feed
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'check_in', 'friend_request', 'friend_accepted', 'walk_started', 'walk_ended', 'walk_joined'
  )),
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users can view activities where they are the user or actor
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = actor_id);

-- Users can insert activities where they are the actor
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
CREATE POLICY "Users can insert own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Create indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_actor_id ON activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Function to get friends' recent activities
CREATE OR REPLACE FUNCTION get_friends_recent_activities(user_id_param UUID, limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  actor_id UUID,
  actor_username TEXT,
  actor_full_name TEXT,
  actor_dog_name TEXT,
  actor_avatar_url TEXT,
  activity_type TEXT,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.actor_id,
    p.username,
    p.full_name,
    p.dog_name,
    p.avatar_url,
    a.activity_type,
    a.activity_data,
    a.created_at
  FROM activities a
  JOIN profiles p ON a.actor_id = p.id
  WHERE a.actor_id IN (
    SELECT friend_id FROM friends 
    WHERE friends.user_id = user_id_param AND status = 'accepted'
    UNION
    SELECT friends.user_id FROM friends 
    WHERE friend_id = user_id_param AND status = 'accepted'
  )
  ORDER BY a.created_at DESC
  LIMIT limit_param;
END;
$$;