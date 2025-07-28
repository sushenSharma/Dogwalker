import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface LocationCheckInProps {
  onCheckIn: (location: LocalCheckInLocation) => void;
  existingCheckIns?: LocalCheckInLocation[];
  currentLocation?: { lat: number; lng: number };
}

const LocationCheckIn: React.FC<LocationCheckInProps> = ({
  onCheckIn,
  existingCheckIns = [],
  currentLocation
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInName, setCheckInName] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [userLocation, setUserLocation] = useState(currentLocation || { lat: 37.7749, lng: -122.4194 });
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Custom marker icons without emojis
  const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="12" fill="#8B5CF6" stroke="#fff" stroke-width="3"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const checkInIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="12" fill="#10B981" stroke="#fff" stroke-width="3"/>
        <path d="M10 16l4 4 8-8" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const selectedIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="12" fill="#F59E0B" stroke="#fff" stroke-width="3"/>
        <circle cx="16" cy="12" r="3" fill="white"/>
        <path d="M16 18 L16 25" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Component to handle map clicks and capture map reference
  const MapClickHandler = () => {
    const map = useMapEvents({
      click: (e) => {
        setSelectedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        setShowCheckInModal(true);
      },
    });
    
    // Store map reference
    if (mapRef.current !== map) {
      mapRef.current = map;
    }
    
    return null;
  };

  const centerMapOnCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          
          // Update user location state
          setUserLocation({ lat: currentLat, lng: currentLng });
          
          // Center map on actual current location
          if (mapRef.current) {
            mapRef.current.setView([currentLat, currentLng], 16);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          // Fallback to stored user location if GPS fails
          if (mapRef.current) {
            mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
          }
          alert('Unable to get your current location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleCheckIn = () => {
    if (!selectedLocation) return;

    const newCheckIn: LocalCheckInLocation = {
      id: Date.now().toString(),
      name: checkInName || 'Check-in Location',
      type: 'custom',
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      timestamp: new Date(),
      notes: checkInNotes,
      is_public: isPublic,
    };

    onCheckIn(newCheckIn);
    setShowCheckInModal(false);
    setSelectedLocation(null);
    setCheckInName('');
    setCheckInNotes('');
    setIsPublic(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler />
        
        {/* User location marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <div className="font-semibold">You are here</div>
              <div className="text-sm text-gray-600">Tap anywhere to check in</div>
            </div>
          </Popup>
        </Marker>

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedIcon}>
            <Popup>
              <div className="text-center">
                <div className="font-semibold">Check-in Location</div>
                <div className="text-sm text-gray-600">Click the button below to check in</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Existing check-in markers */}
        {existingCheckIns.map((checkIn) => (
          <Marker
            key={checkIn.id}
            position={[checkIn.lat, checkIn.lng]}
            icon={checkInIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold">{checkIn.name}</div>
                <div className="text-xs text-gray-600">
                  {formatTime(checkIn.timestamp)}
                </div>
                {checkIn.notes && (
                  <div className="text-sm text-gray-700 mt-1">
                    {checkIn.notes}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg p-3 mx-auto max-w-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📍</span>
            <span className="text-sm font-medium text-gray-700">
              Tap anywhere on the map to check in at that location
            </span>
          </div>
        </div>
      </div>

      {/* Compass and Check-in Buttons */}
      <div className="absolute bottom-20 right-4 z-[1000] flex flex-col space-y-3">
        {/* Compass Button - Center on current location */}
        <button
          onClick={centerMapOnCurrentLocation}
          className="bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 border border-gray-200 flex items-center justify-center"
          title="Center map on current location"
        >
          <span className="text-lg">🧭</span>
        </button>
        
        {/* Check-in at Current Location Button */}
        <button
          onClick={() => {
            // Get fresh GPS location for check-in
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const currentLat = position.coords.latitude;
                  const currentLng = position.coords.longitude;
                  setUserLocation({ lat: currentLat, lng: currentLng });
                  setSelectedLocation({ lat: currentLat, lng: currentLng });
                  setShowCheckInModal(true);
                },
                (error) => {
                  console.error('Error getting location for check-in:', error);
                  // Fallback to stored location
                  setSelectedLocation({ lat: userLocation.lat, lng: userLocation.lng });
                  setShowCheckInModal(true);
                }
              );
            } else {
              setSelectedLocation({ lat: userLocation.lat, lng: userLocation.lng });
              setShowCheckInModal(true);
            }
          }}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center"
          title="Check in at current location"
        >
          <span className="text-lg">📍</span>
        </button>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              {selectedLocation && 
               selectedLocation.lat === userLocation.lat && 
               selectedLocation.lng === userLocation.lng 
                ? "Check In at Current Location" 
                : "Check In Here"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={checkInName}
                  onChange={(e) => setCheckInName(e.target.value)}
                  placeholder={
                    selectedLocation && 
                    selectedLocation.lat === userLocation.lat && 
                    selectedLocation.lng === userLocation.lng 
                      ? "e.g., My Current Location, Dog Park"
                      : "e.g., Central Park, Coffee Shop"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="Add a note about this location..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700">
                    Share with friends (visible to your friends)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {isPublic 
                    ? "Your friends will see this check-in on their feed and map" 
                    : "This check-in will only be visible to you"
                  }
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCheckInModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckIn}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Check In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationCheckIn;