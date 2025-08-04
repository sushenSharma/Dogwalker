import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { activityService, Activity } from '../lib/activityService';

interface Friend {
  id: string;
  name: string;
  dogName: string;
  isWalking: boolean;
  lastSeen: string;
  distance?: string;
}

interface User {
  id: string;
  username: string;
  full_name: string;
  dog_name: string;
  avatar_url?: string;
  created_at: string;
}

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const loadFriends = async () => {
    try {
      setFriendsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found');
        return;
      }

      const { data: friendships, error: friendsError } = await supabase
        .from('friends')
        .select(`
          friend_id,
          profiles!friends_friend_id_fkey (
            id,
            username,
            full_name,
            dog_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendsError) {
        console.error('Error loading friends:', friendsError);
        return;
      }

      const friendsData: Friend[] = (friendships || []).map((friendship: any) => ({
        id: friendship.friend_id,
        name: friendship.profiles?.full_name || friendship.profiles?.username || 'Unknown',
        dogName: friendship.profiles?.dog_name || 'No dog name',
        isWalking: false,
        lastSeen: 'Unknown',
      }));

      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const activities = await activityService.getRecentActivities(5);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
    loadRecentActivities();

    // Subscribe to real-time activity updates
    const subscription = activityService.subscribeToActivities((newActivity) => {
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading all users from database...');
      
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error loading users:', error);
        return;
      }

      console.log('👥 Found users:', users);
      setAllUsers(users || []);
    } catch (error) {
      console.error('❌ Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriendClick = async () => {
    setShowAddFriend(true);
    await loadAllUsers();
  };

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dog Friends 👥
        </h1>
        <p className="text-gray-600">
          Connect with other dog owners in your area
        </p>
      </header>

      <div className="space-y-4">
        {/* Add Friend Button */}
        <button 
          onClick={handleAddFriendClick}
          className="w-full bg-primary text-white rounded-lg p-4 font-medium hover:bg-purple-700 transition-colors"
        >
          + Add New Friend
        </button>

        {/* Currently Walking Friends */}
        {friends.filter((friend) => friend.isWalking).length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Currently Walking
            </h2>
            <div className="space-y-3">
              {friends
                .filter((friend) => friend.isWalking)
                .map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        🐕
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {friend.name} & {friend.dogName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {friend.distance} away • {friend.lastSeen}
                        </p>
                      </div>
                    </div>
                    <button className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Join Walk
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Recent Activity
          </h2>
          {activitiesLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading activities...</p>
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                    {activity.actor_full_name?.charAt(0)?.toUpperCase() || 
                     activity.actor_username?.charAt(0)?.toUpperCase() || 
                     '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activityService.formatActivityText(activity)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activityService.getRelativeTime(activity.created_at)}
                    </p>
                  </div>
                  <div className="text-lg">
                    {activityService.getActivityIcon(activity.activity_type)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-3xl mb-2">📱</div>
              <p className="text-gray-500 text-sm">No recent activity</p>
              <p className="text-xs text-gray-400 mt-1">
                Activity from your friends will appear here
              </p>
            </div>
          )}
        </div>

        {/* All Friends */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            All Friends
          </h2>
          {friendsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-600">Loading friends...</p>
            </div>
          ) : friends.length > 0 ? (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      🐕
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {friend.name} & {friend.dogName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            friend.isWalking ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        <p className="text-sm text-gray-600">
                          {friend.isWalking ? 'Walking now' : friend.lastSeen}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-500">No friends yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Add friends to see them here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {allUsers.length} users found in the database
              </p>
            </div>
            
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : allUsers.length > 0 ? (
                <div className="p-4 space-y-3">
                  {allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.full_name?.charAt(0)?.toUpperCase() || 
                           user.username?.charAt(0)?.toUpperCase() || 
                           '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {user.full_name || user.username || 'Unknown User'}
                          </p>
                          {user.dog_name && (
                            <p className="text-xs text-gray-600">🐕 {user.dog_name}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            @{user.username || user.id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                      <button className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors">
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-gray-500">No users found in database</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Users will appear here when they sign up and create profiles
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;