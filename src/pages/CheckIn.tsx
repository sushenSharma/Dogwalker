import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationCheckIn from '../components/LocationCheckIn';
import { useWalk } from '../contexts/WalkContext';
import { checkInsService, CheckInLocation } from '../lib/checkInsService';

interface LocalCheckInLocation {
  id: string;
  name: string;
  type: 'park' | 'poi' | 'custom';
  lat: number;
  lng: number;
  timestamp: Date;
  notes?: string;
  photo?: string;
  is_public?: boolean;
}

const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { isWalking } = useWalk();
  const [checkIns, setCheckIns] = useState<LocalCheckInLocation[]>([]);
  const [showRecentCheckIns, setShowRecentCheckIns] = useState(false);

  // Load existing check-ins from Supabase
  useEffect(() => {
    loadUserCheckIns();
  }, []);

  const loadUserCheckIns = async () => {
    try {
      const userCheckIns = await checkInsService.getUserCheckIns();
      const localCheckIns = userCheckIns.map((checkIn: CheckInLocation) => ({
        id: checkIn.id,
        name: checkIn.location_name,
        type: checkIn.location_type,
        lat: checkIn.latitude,
        lng: checkIn.longitude,
        timestamp: new Date(checkIn.created_at),
        notes: checkIn.notes,
        photo: checkIn.photo_url,
      }));
      setCheckIns(localCheckIns);
    } catch (error) {
      console.error('Error loading check-ins:', error);
      // Fallback to localStorage if Supabase fails
      const savedCheckIns = localStorage.getItem('dogWalkerCheckIns');
      if (savedCheckIns) {
        const parsed = JSON.parse(savedCheckIns);
        setCheckIns(parsed.map((checkIn: any) => ({
          ...checkIn,
          timestamp: new Date(checkIn.timestamp)
        })));
      }
    }
  };

  const handleCheckIn = async (newCheckIn: LocalCheckInLocation) => {
    try {
      // Save to Supabase
      const savedCheckIn = await checkInsService.createCheckIn({
        location_name: newCheckIn.name,
        location_type: newCheckIn.type,
        latitude: newCheckIn.lat,
        longitude: newCheckIn.lng,
        notes: newCheckIn.notes,
        photo_url: newCheckIn.photo,
        is_public: newCheckIn.is_public ?? true,
      });

      // Update local state
      const localCheckIn: LocalCheckInLocation = {
        id: savedCheckIn.id,
        name: savedCheckIn.location_name,
        type: savedCheckIn.location_type,
        lat: savedCheckIn.latitude,
        lng: savedCheckIn.longitude,
        timestamp: new Date(savedCheckIn.created_at),
        notes: savedCheckIn.notes,
        photo: savedCheckIn.photo_url,
      };

      const updatedCheckIns = [localCheckIn, ...checkIns];
      setCheckIns(updatedCheckIns);
      
      // Also save to localStorage as backup
      localStorage.setItem('dogWalkerCheckIns', JSON.stringify(updatedCheckIns));
      
      // Show success notification
      alert(`✅ Checked in at ${newCheckIn.name}! Your friends can now see this location.`);
    } catch (error) {
      console.error('Error saving check-in:', error);
      
      // Fallback to localStorage only
      const updatedCheckIns = [newCheckIn, ...checkIns];
      setCheckIns(updatedCheckIns);
      localStorage.setItem('dogWalkerCheckIns', JSON.stringify(updatedCheckIns));
      
      alert(`✅ Checked in at ${newCheckIn.name}! (Saved locally)`);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const recentCheckIns = checkIns.slice(0, 5);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Location Check-In
          </h1>
          <button
            onClick={() => setShowRecentCheckIns(!showRecentCheckIns)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            📋
          </button>
        </div>
      </div>

      {/* Walking Status Banner */}
      {isWalking && (
        <div className="bg-green-100 border-b border-green-200 p-3">
          <div className="max-w-md mx-auto flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-800 text-sm font-medium">
              Currently on a walk - Check in at interesting spots!
            </span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        <LocationCheckIn
          onCheckIn={handleCheckIn}
          existingCheckIns={checkIns}
        />
      </div>

      {/* Recent Check-ins Panel */}
      {showRecentCheckIns && (
        <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-xl shadow-lg z-[1000] max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Check-ins</h3>
              <button
                onClick={() => setShowRecentCheckIns(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {recentCheckIns.length > 0 ? (
              <div className="space-y-1">
                {recentCheckIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">📍</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {checkIn.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(checkIn.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(checkIn.timestamp)}
                        </p>
                        {checkIn.notes && (
                          <p className="text-sm text-gray-700 mt-1">
                            {checkIn.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">📍</div>
                <p className="text-gray-500 text-sm">
                  No check-ins yet. Tap anywhere on the map to check in!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="absolute bottom-4 right-4 z-[999]">
        <button
          onClick={() => navigate('/walk')}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600"
        >
          🚶‍♂️
        </button>
      </div>
    </div>
  );
};

export default CheckIn;