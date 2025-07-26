-- Database schema for shared check-ins feature
-- Run these SQL commands in your Supabase SQL editor

-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  location_type VARCHAR(20) DEFAULT 'custom' CHECK (location_type IN ('park', 'poi', 'custom')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  notes TEXT,
  photo_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friends table (if not exists)
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create profiles table (if not exists) 
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  dog_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for check_ins
-- Users can insert their own check-ins
CREATE POLICY "Users can insert own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own check-ins
CREATE POLICY "Users can view own check-ins" ON check_ins
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view public check-ins from friends
CREATE POLICY "Users can view friends public check-ins" ON check_ins
  FOR SELECT USING (
    is_public = true AND 
    user_id IN (
      SELECT friend_id FROM friends 
      WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM friends 
      WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

-- Users can update their own check-ins
CREATE POLICY "Users can update own check-ins" ON check_ins
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own check-ins
CREATE POLICY "Users can delete own check-ins" ON check_ins
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for friends
-- Users can view friendships they're part of
CREATE POLICY "Users can view own friendships" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can insert friend requests
CREATE POLICY "Users can insert friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update friendships they're part of
CREATE POLICY "Users can update own friendships" ON friends
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for profiles
-- Everyone can view profiles (for friend discovery)
CREATE POLICY "Everyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON check_ins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_check_ins_public ON check_ins(is_public);
CREATE INDEX IF NOT EXISTS idx_friends_user_friend ON friends(user_id, friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Function to get friends' recent check-ins
CREATE OR REPLACE FUNCTION get_friends_recent_checkins(user_id_param UUID, limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  dog_name TEXT,
  avatar_url TEXT,
  location_name TEXT,
  location_type TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    p.username,
    p.full_name,
    p.dog_name,
    p.avatar_url,
    c.location_name,
    c.location_type,
    c.latitude,
    c.longitude,
    c.notes,
    c.photo_url,
    c.created_at
  FROM check_ins c
  JOIN profiles p ON c.user_id = p.id
  WHERE c.is_public = true
    AND c.user_id IN (
      SELECT friend_id FROM friends 
      WHERE friends.user_id = user_id_param AND status = 'accepted'
      UNION
      SELECT friends.user_id FROM friends 
      WHERE friend_id = user_id_param AND status = 'accepted'
    )
  ORDER BY c.created_at DESC
  LIMIT limit_param;
END;
$$;