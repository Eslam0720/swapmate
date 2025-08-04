import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import SwipeCard from './SwipeCard';
import SearchFilters, { FilterOptions } from './SearchFilters';
import SortOptions, { SortOption } from './SortOptions';
import LikeButton from './LikeButton';
import { Asset } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import { calculateDistance, formatDistance } from '@/utils/location';

interface SwipeInterfaceProps {
  onLike: (assetId: string) => void;
  onPass: (assetId: string) => void;
}

const SwipeInterface: React.FC<SwipeInterfaceProps> = ({ onLike, onPass }) => {
  const { getFilteredAssets, users, userLocation, locationLoading, locationError, refreshAssets } = useAppContext();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('most-relevant');
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    latitude: undefined,
    longitude: undefined,
    assetType: 'all',
    swapType: 'all',
    priceRange: [0, 1000000],
    radius: 50
  });

  const filteredAssets = useMemo(() => {
    return getFilteredAssets(filters, sortBy);
  }, [getFilteredAssets, filters, sortBy]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const handleAssetDelete = () => {
    // Refresh assets after deletion
    refreshAssets();
  };

  const getDistanceInfo = (asset: Asset) => {
    const referenceLocation = (filters.latitude && filters.longitude) 
      ? { latitude: filters.latitude, longitude: filters.longitude }
      : userLocation;
    
    if (!referenceLocation || !asset.latitude || !asset.longitude) return null;
    
    const distance = calculateDistance(referenceLocation, {
      latitude: asset.latitude,
      longitude: asset.longitude
    });
    return formatDistance(distance);
  };

  if (filteredAssets.length === 0) {
    return (
      <div className="space-y-4 bg-white p-4 rounded-lg">
        <SearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />
        <SortOptions value={sortBy} onChange={handleSortChange} />
        <div className="flex flex-col items-center justify-center h-96 text-center bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">No assets found!</h2>
          <p className="text-gray-600">Try adjusting your filters or check back later for new listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <SearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />
        <SortOptions value={sortBy} onChange={handleSortChange} />
      </div>
      {locationLoading && (
        <div className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <MapPin className="w-4 h-4 inline mr-1" />
          Getting your location...
        </div>
      )}
      {locationError && (
        <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{locationError}</span>
          </div>
          <p className="text-xs mt-1 text-amber-700">
            Showing all assets. Enable location access for distance-based results.
          </p>
        </div>
      )}
      <div className="space-y-6 pb-20">
        {filteredAssets.map((asset) => {
          const assetUser = users.find(user => user.id === asset.userId);
          const distanceInfo = getDistanceInfo(asset);
          
          return (
            <div key={asset.id} className="w-full space-y-4">
              <div className="relative w-full">
                <SwipeCard 
                  asset={asset} 
                  user={assetUser} 
                  onSwipe={() => {}} 
                  onDelete={handleAssetDelete}
                />
                {distanceInfo && (
                  <div className="absolute top-2 right-16 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center z-10">
                    <MapPin className="w-3 h-3 mr-1" />
                    {distanceInfo}
                  </div>
                )}
                <LikeButton 
                  assetId={asset.id}
                  ownerId={asset.userId}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SwipeInterface;