// Utility functions for opening locations in maps

export interface LocationData {
  latitude: number;
  longitude: number;
  location_name: string;
}

/**
 * Opens a location in the appropriate maps app based on the user's device
 * - iOS/Mac: Apple Maps
 * - Other: Google Maps
 */
export const openInMaps = (location: LocationData) => {
  const lat = location.latitude;
  const lng = location.longitude;
  const locationName = encodeURIComponent(location.location_name);
  
  // Detect if it's iOS (for Apple Maps) or other (for Google Maps)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMac = /Macintosh/.test(navigator.userAgent);
  
  if (isIOS || isMac) {
    // Open in Apple Maps
    const appleMapUrl = `http://maps.apple.com/?q=${locationName}&ll=${lat},${lng}&z=16`;
    window.open(appleMapUrl, '_blank');
  } else {
    // Open in Google Maps
    const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${locationName}`;
    window.open(googleMapUrl, '_blank');
  }
};

/**
 * Gets directions to a location in the appropriate maps app
 */
export const getDirectionsTo = (location: LocationData) => {
  const lat = location.latitude;
  const lng = location.longitude;
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMac = /Macintosh/.test(navigator.userAgent);
  
  if (isIOS || isMac) {
    // Get directions in Apple Maps
    const appleMapUrl = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`; // w = walking directions
    window.open(appleMapUrl, '_blank');
  } else {
    // Get directions in Google Maps
    const googleMapUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    window.open(googleMapUrl, '_blank');
  }
};

/**
 * Copies location coordinates to clipboard
 */
export const copyLocationToClipboard = async (location: LocationData) => {
  const coordinates = `${location.latitude}, ${location.longitude}`;
  
  try {
    await navigator.clipboard.writeText(coordinates);
    return true;
  } catch (error) {
    console.error('Failed to copy coordinates:', error);
    return false;
  }
};