export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: UserLocation | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Get user's current location
  async getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location access denied by user'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out'));
              break;
            default:
              reject(new Error('An unknown error occurred while retrieving location'));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format distance for display
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  }

  // Check if a location is within radius
  isWithinRadius(
    centerLat: number,
    centerLon: number,
    targetLat: number,
    targetLon: number,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(centerLat, centerLon, targetLat, targetLon);
    return distance <= radiusKm;
  }

  // Get cached location if available
  getCachedLocation(): UserLocation | null {
    return this.currentLocation;
  }

  // Request permission for location access
  async requestLocationPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
      return false;
    }

    try {
      await this.getCurrentLocation();
      return true;
    } catch (error) {
      console.error('Location permission denied:', error);
      return false;
    }
  }
}

export const locationService = LocationService.getInstance();