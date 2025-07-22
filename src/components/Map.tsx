import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Friend {
  id: string;
  name: string;
  dogName: string;
  lat: number;
  lng: number;
  isWalking: boolean;
}

interface MapProps {
  showFriends?: boolean;
  userLocation?: { lat: number; lng: number };
  friends?: Friend[];
}

const Map: React.FC<MapProps> = ({ 
  showFriends = true, 
  userLocation = { lat: 37.7749, lng: -122.4194 }, // Default to SF
  friends = []
}) => {
  const [currentLocation, setCurrentLocation] = useState(userLocation);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
        }
      );
    }
  }, []);

  // Create custom icons for different markers
  const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="10" fill="#8B5CF6" stroke="#fff" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-family="Arial">👤</text>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const friendIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="10" fill="#10B981" stroke="#fff" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-family="Arial">🐕</text>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <div className="font-semibold">You are here</div>
              <div className="text-sm text-gray-600">Current location</div>
            </div>
          </Popup>
        </Marker>

        {/* User's walking radius */}
        <Circle
          center={[currentLocation.lat, currentLocation.lng]}
          radius={500} // 500 meters
          pathOptions={{
            color: '#8B5CF6',
            fillColor: '#8B5CF6',
            fillOpacity: 0.1,
            weight: 2,
          }}
        />

        {/* Friend markers */}
        {showFriends && friends.map((friend) => (
          <Marker
            key={friend.id}
            position={[friend.lat, friend.lng]}
            icon={friendIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold">{friend.name} & {friend.dogName}</div>
                <div className="text-sm text-gray-600">
                  {friend.isWalking ? '🚶‍♂️ Currently walking' : '🏠 At home'}
                </div>
                {friend.isWalking && (
                  <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm">
                    Join Walk
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;