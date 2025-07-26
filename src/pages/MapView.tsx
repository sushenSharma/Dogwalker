import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { checkInsService, CheckInWithProfile } from '../lib/checkInsService';
import { openInMaps } from '../lib/mapsUtils';

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
  
  // Mock friends data with locations around San Francisco
  const [friends] = useState<Friend[]>([
    {
      id: '1',
      name: 'Sarah',
      dogName: 'Buddy',
      lat: 37.7849,
      lng: -122.4094,
      isWalking: true,
      distance: '0.2 miles',
    },
    {
      id: '2',
      name: 'Mike',
      dogName: 'Luna',
      lat: 37.7649,
      lng: -122.4194,
      isWalking: false,
      distance: '0.8 miles',
    },
    {
      id: '3',
      name: 'Emma',
      dogName: 'Charlie',
      lat: 37.7749,
      lng: -122.4294,
      isWalking: true,
      distance: '0.5 miles',
    },
  ]);

  // Load friends' recent check-ins
  useEffect(() => {
    loadFriendsCheckIns();
  }, []);

  const loadFriendsCheckIns = async () => {
    try {
      const checkIns = await checkInsService.getFriendsCheckIns(20);
      setFriendsCheckIns(checkIns);
    } catch (error) {
      console.error('Error loading friends check-ins for map:', error);
    }
  };


  const walkingFriends = friends.filter(friend => friend.isWalking);

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
          <Map friends={friends} showFriends={true} />
        </div>

        {/* Floating Lists */}
        <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto space-y-3">
          {/* Recent Check-ins */}
          {friendsCheckIns.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">
                  Recent Check-ins ({friendsCheckIns.length})
                </h2>
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              </div>
              
              <div className="space-y-2">
                {friendsCheckIns.slice(0, 3).map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => openInMaps(checkIn)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-sm">
                        📍
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {checkIn.full_name || checkIn.username}
                          {checkIn.dog_name && ` & ${checkIn.dog_name}`}
                        </p>
                        <p className="text-xs text-gray-600">{checkIn.location_name}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(checkIn.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Walking Friends */}
          <div className="bg-white rounded-xl shadow-lg p-4 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">
                Walking Now ({walkingFriends.length})
              </h2>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            
            {walkingFriends.length > 0 ? (
              <div className="space-y-2">
                {walkingFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-sm">
                        🐕
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {friend.name} & {friend.dogName}
                        </p>
                        <p className="text-xs text-gray-600">{friend.distance} away</p>
                      </div>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-xs font-medium">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">🚶‍♀️</div>
                <p className="text-gray-500 text-sm">No friends walking nearby</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Walk Button */}
        <div className="absolute top-4 left-4 right-4 max-w-md mx-auto">
          <button
            onClick={() => navigate('/walk')}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold shadow-lg"
          >
            🚶‍♂️ Start Walking
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;