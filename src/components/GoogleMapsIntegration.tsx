import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { FilterOptions } from './SearchFilters';

const GoogleMapsIntegration: React.FC = () => {
  const { getFilteredAssets } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    assetType: 'all',
    priceRange: [0, 1000000],
    radius: 50
  });

  const handleSearch = () => {
    // Simulate geocoding - in real app would use Google Maps API
    const mockLocation = {
      lat: 40.7128,
      lng: -74.0060,
      address: searchQuery || 'New York, NY'
    };
    
    setFilters(prev => ({
      ...prev,
      location: mockLocation.address,
      latitude: mockLocation.lat,
      longitude: mockLocation.lng
    }));
  };

  const filteredAssets = getFilteredAssets(filters);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Location Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              <MapPin className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredAssets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{asset.title}</h3>
                  <p className="text-sm text-gray-600">{asset.location}</p>
                  <p className="text-sm mt-1">{asset.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${asset.price?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{asset.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GoogleMapsIntegration;