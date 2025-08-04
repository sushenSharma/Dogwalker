import { supabase } from './supabase';

export interface CheckInLocation {
  id: string;
  user_id: string;
  location_name: string;
  location_type: 'park' | 'poi' | 'custom';
  latitude: number;
  longitude: number;
  notes?: string;
  photo_url?: string;
  is_public: boolean;
  created_at: string;
}

export interface CheckInWithProfile extends CheckInLocation {
  username: string;
  full_name: string;
  dog_name: string;
  avatar_url: string;
}

export const checkInsService = {
  // Create a new check-in
  async createCheckIn(checkIn: Omit<CheckInLocation, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Ensure user profile exists
    await this.ensureProfileExists(user);

    const { data, error } = await supabase
      .from('check_ins')
      .insert([
        {
          user_id: user.id,
          location_name: checkIn.location_name,
          location_type: checkIn.location_type,
          latitude: checkIn.latitude,
          longitude: checkIn.longitude,
          notes: checkIn.notes,
          photo_url: checkIn.photo_url,
          is_public: checkIn.is_public,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating check-in:', error);
      throw error;
    }

    // Create activity notification for friends
    if (data && checkIn.is_public) {
      await this.createActivity(user.id, 'check_in', {
        location_name: checkIn.location_name,
        location_type: checkIn.location_type,
        notes: checkIn.notes,
        check_in_id: data.id
      });
    }

    return data;
  },

  // Helper function to ensure user profile exists
  async ensureProfileExists(user: any) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous User',
            dog_name: '',
          }
        ]);

      if (error) {
        console.error('Error creating profile:', error);
        // Don't throw error, just log it - check-in can still work without profile
      }
    }
  },

  // Get user's own check-ins
  async getUserCheckIns(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user check-ins:', error);
      throw error;
    }

    return data;
  },

  // Get friends' recent check-ins for feed
  async getFriendsCheckIns(limit = 10): Promise<CheckInWithProfile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .rpc('get_friends_recent_checkins', {
        user_id_param: user.id,
        limit_param: limit
      });

    if (error) {
      console.error('Error fetching friends check-ins:', error);
      throw error;
    }

    return data || [];
  },

  // Get check-ins near a location (for map view)
  async getNearbyCheckIns(lat: number, lng: number, radiusKm = 5, limit = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Simple bounding box query (for more precise distance, you'd use PostGIS)
    const latDelta = radiusKm / 111; // Approximate km to degrees
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          dog_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching nearby check-ins:', error);
      throw error;
    }

    return data;
  },

  // Update check-in
  async updateCheckIn(id: string, updates: Partial<CheckInLocation>) {
    const { data, error } = await supabase
      .from('check_ins')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating check-in:', error);
      throw error;
    }

    return data;
  },

  // Delete check-in
  async deleteCheckIn(id: string) {
    const { error } = await supabase
      .from('check_ins')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting check-in:', error);
      throw error;
    }

    return true;
  },

  // Subscribe to real-time check-in updates from friends
  subscribeFriendsCheckIns(callback: (checkIn: CheckInWithProfile) => void) {
    return supabase
      .channel('friends_checkins')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'check_ins',
          filter: 'is_public=eq.true'
        }, 
        async (payload) => {
          // Fetch the profile data for the new check-in
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, dog_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          if (profile) {
            const checkInWithProfile: CheckInWithProfile = {
              ...payload.new as CheckInLocation,
              ...profile
            };
            callback(checkInWithProfile);
          }
        }
      )
      .subscribe();
  },

  // Helper function to create activity notifications
  async createActivity(actorId: string, activityType: string, activityData: any) {
    try {
      // Get friends of the actor to notify them
      const { data: friends } = await supabase
        .from('friends')
        .select('user_id, friend_id')
        .or(`user_id.eq.${actorId},friend_id.eq.${actorId}`)
        .eq('status', 'accepted');

      if (!friends || friends.length === 0) return;

      // Create activity records for each friend
      const activities = friends.map(friendship => ({
        user_id: friendship.user_id === actorId ? friendship.friend_id : friendship.user_id,
        actor_id: actorId,
        activity_type: activityType,
        activity_data: activityData
      }));

      const { error } = await supabase
        .from('activities')
        .insert(activities);

      if (error) {
        console.error('Error creating activity notifications:', error);
      }
    } catch (error) {
      console.error('Error in createActivity:', error);
    }
  }
};

// Profile service for user management
export const profileService = {
  // Get or create user profile
  async getOrCreateProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Try to get existing profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile if doesn't exist
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          full_name: user.user_metadata?.full_name || '',
          dog_name: '',
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return newProfile;
  },

  // Update profile
  async updateProfile(updates: Partial<{
    username: string;
    full_name: string;
    dog_name: string;
    avatar_url: string;
  }>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  }
};