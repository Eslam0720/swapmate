import { LocationData } from '@/types';

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  coord1: LocationData,
  coord2: LocationData
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
    Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Convert distance to miles
export const kmToMiles = (km: number): number => {
  return km * 0.621371;
};

// Format distance for display
export const formatDistance = (km: number, unit: 'km' | 'miles' = 'km'): string => {
  const distance = unit === 'miles' ? kmToMiles(km) : km;
  return `${distance.toFixed(1)} ${unit}`;
};

// Sort assets by distance from user location
export const sortByDistance = <T extends { latitude?: number; longitude?: number }>(
  items: T[],
  userLocation: LocationData
): T[] => {
  return items
    .filter(item => item.latitude && item.longitude)
    .sort((a, b) => {
      const distanceA = calculateDistance(userLocation, {
        latitude: a.latitude!,
        longitude: a.longitude!
      });
      const distanceB = calculateDistance(userLocation, {
        latitude: b.latitude!,
        longitude: b.longitude!
      });
      return distanceA - distanceB;
    });
};