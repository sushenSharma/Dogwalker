import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { checkInsService, CheckInWithProfile } from '../lib/checkInsService';
import { openInMaps } from '../lib/mapsUtils';
import { locationService, UserLocation } from '../lib/locationService';
import { supabase } from '../lib/supabase';

interface Friend {
  id: string;
  name: string;
  dogName: string;
  lat: number;
  lng: number;
  isWalking: boolean;
  distance: string;
}

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [friendsCheckIns, setFriendsCheckIns] = useState<CheckInWithProfile[]>([]);
  const [nearbyCheckIns, setNearbyCheckIns] = useState<CheckInWithProfile[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // No mock data - using real database check-ins only

  // Load user location and nearby check-ins
  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      setLoading(true);
      setLocationError(null);
      
      // Get user's current location
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      
      // Load nearby check-ins within 10km
      await loadNearbyCheckIns(location.latitude, location.longitude);
      
      // Also load friends' check-ins
      await loadFriendsCheckIns();
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyCheckIns = async (lat: number, lng: number) => {
    try {
      console.log('🔍 Searching for check-ins near:', { lat, lng, radius: '10km' });
      
      // Simple query first - get all public check-ins
      const { data: checkIns, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(100);
      
      console.log('📊 Simple query result:', { checkIns, error });

      if (error) {
        console.error('❌ Database error:', error);
        setNearbyCheckIns([]);
        return;
      }

      console.log('📊 All public check-ins from database:', checkIns);
      
      if (!checkIns || checkIns.length === 0) {
        console.log('❌ No public check-ins found in database');
        setNearbyCheckIns([]);
        return;
      }
      
      // Filter and add distance calculations
      const checkInsWithDistance = checkIns
        .map((checkIn: any) => {
          const distance = locationService.calculateDistance(
            lat,
            lng,
            checkIn.latitude,
            checkIn.longitude
          );
          
          console.log(`📍 Check-in: ${checkIn.location_name}, Distance: ${distance.toFixed(2)}km`);
          
          // Simple display name - we'll improve this later
          const shortId = checkIn.user_id.substring(0, 8);
          const displayName = `User ${shortId}`;
          const username = shortId;
          
          return {
            id: checkIn.id,
            user_id: checkIn.user_id,
            username: username,
            full_name: displayName,
            dog_name: '',
            avatar_url: '',
            location_name: checkIn.location_name,
            location_type: checkIn.location_type,
            latitude: checkIn.latitude,
            longitude: checkIn.longitude,
            notes: checkIn.notes,
            photo_url: checkIn.photo_url,
            is_public: checkIn.is_public,
            created_at: checkIn.created_at,
            distance: distance,
            distanceFormatted: locationService.formatDistance(distance)
          };
        })
        .filter((checkIn: any) => checkIn.distance <= 10) // Ensure within 10km
        .sort((a: any, b: any) => a.distance - b.distance); // Sort by distance

      console.log('✅ Filtered check-ins within 10km:', checkInsWithDistance);
      setNearbyCheckIns(checkInsWithDistance);
    } catch (error) {
      console.error('❌ Error loading nearby check-ins:', error);
      setNearbyCheckIns([]);
    }
  };

  const loadFriendsCheckIns = async () => {
    try {
      const checkIns = await checkInsService.getFriendsCheckIns(20);
      setFriendsCheckIns(checkIns);
    } catch (error) {
      console.error('Error loading friends check-ins for map:', error);
    }
  };


  // Filter for currently walking friends from nearby check-ins
  const walkingFriends = nearbyCheckIns.filter((checkIn: any) => {
    // For now, we'll show recent check-ins (within last 2 hours) as "walking"
    const checkInTime = new Date(checkIn.created_at);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    return checkInTime > twoHoursAgo;
  });

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Friends Near You
          </h1>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            ⚙️
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <Map friends={[]} showFriends={false} />
        </div>

        {/* Content - People Within 10km (Positioned after Start Walk button) */}
        <div className="absolute top-24 left-4 right-4 max-w-md mx-auto space-y-3">
          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-primary">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-gray-700 font-medium">Finding people near you...</span>
              </div>
            </div>
          )}

          {/* Location Error */}
          {locationError && (
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-red-200">
              <div className="text-center">
                <div className="text-red-500 text-2xl mb-2">📍</div>
                <p className="text-red-600 text-sm font-bold mb-2">Location Required</p>
                <p className="text-gray-600 text-sm mb-3">{locationError}</p>
                <button
                  onClick={initializeLocation}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Enable Location
                </button>
              </div>
            </div>
          )}

          {/* People Within 10km - MAIN SECTION */}
          {!loading && !locationError && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-xl p-4 border-2 border-green-200 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    🔍 People Within 10km
                  </h2>
                  <p className="text-sm text-gray-600">
                    {nearbyCheckIns.length} people checked in nearby
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-600 font-medium">LIVE</span>
                </div>
              </div>
              
              {nearbyCheckIns.length > 0 ? (
                <div className="space-y-3">
                  {nearbyCheckIns.slice(0, 6).map((checkIn: any) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-green-50 transition-colors shadow-sm border border-green-100"
                      onClick={() => openInMaps(checkIn)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {checkIn.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {checkIn.full_name}
                            {checkIn.dog_name && (
                              <span className="text-green-600"> & {checkIn.dog_name}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 font-medium">{checkIn.location_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {checkIn.distanceFormatted}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(checkIn.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {nearbyCheckIns.length > 6 && (
                    <div className="text-center pt-2 border-t border-green-200">
                      <span className="text-sm text-green-600 font-medium">
                        +{nearbyCheckIns.length - 6} more people nearby
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-white rounded-lg">
                  <div className="text-4xl mb-3">📍</div>
                  <p className="text-gray-600 text-lg font-semibold mb-2">No one checked in nearby</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Be the first to check in and let others know you're here!
                  </p>
                  <button
                    onClick={() => navigate('/checkin')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    📍 Quick Check-In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recently Active (Walking) */}
          {!loading && !locationError && walkingFriends.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">
                  Recently Active ({walkingFriends.length})
                </h2>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
              
              <div className="space-y-2">
                {walkingFriends.map((checkIn: any) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between p-2 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => openInMaps(checkIn)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-sm">
                        🐕
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {checkIn.full_name}
                          {checkIn.dog_name && ` & ${checkIn.dog_name}`}
                        </p>
                        <p className="text-xs text-gray-600">{checkIn.distanceFormatted} away</p>
                      </div>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-xs font-medium">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Walk Button */}
        <div className="absolute top-4 left-4 right-4 max-w-md mx-auto">
          <button
            disabled
            className="w-full bg-gray-400 text-gray-200 py-3 rounded-lg font-semibold shadow-lg opacity-60 cursor-not-allowed"
          >
            🚶‍♂️ Start Walking
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;