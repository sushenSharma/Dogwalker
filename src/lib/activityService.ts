import { supabase } from './supabase';

export interface Activity {
  id: string;
  actor_id: string;
  actor_username: string;
  actor_full_name: string;
  actor_dog_name: string;
  actor_avatar_url?: string;
  activity_type: 'check_in' | 'friend_request' | 'friend_accepted' | 'walk_started' | 'walk_ended' | 'walk_joined';
  activity_data: any;
  created_at: string;
}

export const activityService = {
  // Get recent activities from friends for the activity feed
  async getRecentActivities(limit = 10): Promise<Activity[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .rpc('get_friends_recent_activities', {
        user_id_param: user.id,
        limit_param: limit
      });

    if (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }

    return data || [];
  },

  // Format activity into displayable text
  formatActivityText(activity: Activity): string {
    const actorName = activity.actor_full_name || activity.actor_username || 'Someone';
    const dogName = activity.actor_dog_name ? ` with ${activity.actor_dog_name}` : '';

    switch (activity.activity_type) {
      case 'check_in':
        const locationName = activity.activity_data?.location_name || 'somewhere';
        return `${actorName}${dogName} checked in at ${locationName}`;
      
      case 'friend_accepted':
        return `${actorName} accepted your friend request`;
      
      case 'walk_started':
        return `${actorName}${dogName} started a walk`;
      
      case 'walk_ended':
        const walkData = activity.activity_data;
        const duration = walkData?.duration ? ` for ${walkData.duration}` : '';
        return `${actorName}${dogName} finished a walk${duration}`;
      
      case 'walk_joined':
        return `${actorName}${dogName} joined a walk`;
      
      default:
        return `${actorName} did something`;
    }
  },

  // Get activity icon based on type
  getActivityIcon(activityType: Activity['activity_type']): string {
    switch (activityType) {
      case 'check_in':
        return '📍';
      case 'friend_request':
      case 'friend_accepted':
        return '👥';
      case 'walk_started':
      case 'walk_ended':
      case 'walk_joined':
        return '🚶';
      default:
        return '📱';
    }
  },

  // Get relative time string
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  },

  // Subscribe to real-time activity updates
  subscribeToActivities(callback: (activity: Activity) => void) {
    return supabase
      .channel('friend_activities')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'activities'
        }, 
        async (payload) => {
          // Fetch the actor profile data for the new activity
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, dog_name, avatar_url')
            .eq('id', payload.new.actor_id)
            .single();

          if (profile) {
            const activityWithProfile: Activity = {
              id: payload.new.id,
              actor_id: payload.new.actor_id,
              actor_username: profile.username,
              actor_full_name: profile.full_name,
              actor_dog_name: profile.dog_name,
              actor_avatar_url: profile.avatar_url,
              activity_type: payload.new.activity_type,
              activity_data: payload.new.activity_data,
              created_at: payload.new.created_at
            };
            callback(activityWithProfile);
          }
        }
      )
      .subscribe();
  },

  // Create friend-related activities
  async createFriendActivity(friendId: string, activityType: 'friend_request' | 'friend_accepted') {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('activities')
      .insert([{
        user_id: friendId,
        actor_id: user.id,
        activity_type: activityType,
        activity_data: {}
      }]);

    if (error) {
      console.error(`Error creating ${activityType} activity:`, error);
      throw error;
    }
  }
};