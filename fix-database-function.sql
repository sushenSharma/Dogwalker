-- Fix the get_friends_recent_checkins function
-- Run this in your Supabase SQL Editor

DROP FUNCTION IF EXISTS get_friends_recent_checkins(UUID, INTEGER);

CREATE OR REPLACE FUNCTION get_friends_recent_checkins(user_id_param UUID, limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  dog_name TEXT,
  avatar_url TEXT,
  location_name TEXT,
  location_type VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
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
    COALESCE(p.username, '')::TEXT as username,
    COALESCE(p.full_name, '')::TEXT as full_name,
    COALESCE(p.dog_name, '')::TEXT as dog_name,
    COALESCE(p.avatar_url, '')::TEXT as avatar_url,
    c.location_name,
    c.location_type,
    c.latitude,
    c.longitude,
    c.notes,
    c.photo_url,
    c.created_at
  FROM check_ins c
  LEFT JOIN profiles p ON c.user_id = p.id
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