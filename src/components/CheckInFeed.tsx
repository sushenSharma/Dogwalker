import React, { useState, useEffect } from 'react';
import { checkInsService, CheckInWithProfile } from '../lib/checkInsService';
import { openInMaps } from '../lib/mapsUtils';

interface CheckInFeedProps {
  maxItems?: number;
  showHeader?: boolean;
}

const CheckInFeed: React.FC<CheckInFeedProps> = ({ 
  maxItems = 10,
  showHeader = true 
}) => {
  const [friendsCheckIns, setFriendsCheckIns] = useState<CheckInWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Try to get friends' check-ins first
        let checkIns = await checkInsService.getFriendsCheckIns(maxItems);
        
        // If no friends' check-ins, show user's own check-ins for testing
        if (checkIns.length === 0) {
          const userCheckIns = await checkInsService.getUserCheckIns(maxItems);
          // Convert user check-ins to the expected format
          checkIns = userCheckIns.map(checkIn => ({
            id: checkIn.id,
            user_id: checkIn.user_id,
            username: 'You',
            full_name: 'Your Check-in',
            dog_name: '',
            avatar_url: '',
            location_name: checkIn.location_name,
            location_type: checkIn.location_type,
            latitude: checkIn.latitude,
            longitude: checkIn.longitude,
            notes: checkIn.notes,
            photo_url: checkIn.photo_url,
            is_public: checkIn.is_public,
            created_at: checkIn.created_at
          }));
        }
        
        setFriendsCheckIns(checkIns);
        setError(null);
      } catch (err) {
        console.error('Error loading check-ins:', err);
        setFriendsCheckIns([]);
        setError('Unable to load check-ins');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Set up real-time subscription
    const subscription = checkInsService.subscribeFriendsCheckIns((newCheckIn) => {
      setFriendsCheckIns(prev => [newCheckIn, ...prev.slice(0, maxItems - 1)]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [maxItems]);

  const loadFriendsCheckIns = async () => {
    try {
      setLoading(true);
      const checkIns = await checkInsService.getFriendsCheckIns(maxItems);
      setFriendsCheckIns(checkIns);
      setError(null);
    } catch (err) {
      console.error('Error loading friends check-ins:', err);
      // Show demo data if database isn't set up yet
      setFriendsCheckIns([]);
      setError('Database not set up yet. Run the SQL schema in Supabase!');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getLocationTypeEmoji = (type: string) => {
    switch (type) {
      case 'park': return '🏞️';
      case 'poi': return '📍';
      default: return '📌';
    }
  };


  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        {showHeader && (
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Friends' Check-ins
          </h2>
        )}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        {showHeader && (
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Friends' Check-ins
          </h2>
        )}
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={loadFriendsCheckIns}
            className="mt-2 text-blue-500 text-sm hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (friendsCheckIns.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        {showHeader && (
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Friends' Check-ins
          </h2>
        )}
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-500 text-sm">No friend check-ins yet</p>
          <p className="text-gray-400 text-xs mt-1">
            When your friends check in at locations, you'll see them here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Friends' Check-ins
          </h2>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      )}
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {friendsCheckIns.map((checkIn) => (
          <div
            key={checkIn.id}
            className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            onClick={() => openInMaps(checkIn)}
          >
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {checkIn.avatar_url ? (
                <img 
                  src={checkIn.avatar_url} 
                  alt={checkIn.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                checkIn.full_name?.charAt(0)?.toUpperCase() || 
                checkIn.username?.charAt(0)?.toUpperCase() || 
                '?'
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {checkIn.full_name || checkIn.username}
                      {checkIn.dog_name && (
                        <span className="text-gray-600"> & {checkIn.dog_name}</span>
                      )}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTime(checkIn.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-sm">
                      {getLocationTypeEmoji(checkIn.location_type)}
                    </span>
                    <p className="text-sm text-gray-700 font-medium">
                      {checkIn.location_name}
                    </p>
                  </div>
                  
                  {checkIn.notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      "{checkIn.notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action button */}
            <button 
              className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering parent click
                openInMaps(checkIn);
              }}
              title="Open in Maps"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {friendsCheckIns.length >= maxItems && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button 
            onClick={() => {/* Navigate to full feed page */}}
            className="w-full text-center text-blue-500 text-sm hover:underline"
          >
            View all check-ins
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckInFeed;