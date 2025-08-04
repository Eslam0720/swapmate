import { Asset, User } from '@/types';
import { calculateDistance } from './location';
import { SortOption } from '@/components/SortOptions';

export const sortAssets = (
  assets: Asset[],
  sortBy: SortOption,
  userLocation?: { latitude: number; longitude: number } | null,
  users?: User[]
): Asset[] => {
  const assetsCopy = [...assets];

  switch (sortBy) {
    case 'highest-cost':
      return assetsCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
    
    case 'lowest-cost':
      return assetsCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
    
    case 'nearest-location':
      if (!userLocation) return assetsCopy;
      return assetsCopy.sort((a, b) => {
        const distanceA = (a.latitude && a.longitude) 
          ? calculateDistance(userLocation, { latitude: a.latitude, longitude: a.longitude })
          : Infinity;
        const distanceB = (b.latitude && b.longitude)
          ? calculateDistance(userLocation, { latitude: b.latitude, longitude: b.longitude })
          : Infinity;
        return distanceA - distanceB;
      });
    
    case 'verified-first':
      if (!users) return assetsCopy;
      return assetsCopy.sort((a, b) => {
        const userA = users.find(u => u.id === a.userId);
        const userB = users.find(u => u.id === b.userId);
        const verifiedA = userA?.verified || false;
        const verifiedB = userB?.verified || false;
        return verifiedB ? 1 : verifiedA ? -1 : 0;
      });
    
    case 'most-relevant':
    default:
      return assetsCopy.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
};