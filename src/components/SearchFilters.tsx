import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { LocationSearch } from './LocationSearch';

export interface FilterOptions {
  location: string;
  latitude?: number;
  longitude?: number;
  assetType: 'all' | 'home' | 'car' | 'others';
  swapType: 'all' | 'permanent' | 'temporary';
  priceRange: [number, number];
  radius: number;
}

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle
}) => {
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    onFiltersChange({
      ...filters,
      location: location.address,
      latitude: location.lat,
      longitude: location.lng
    });
  };

  const handleLocationClear = () => {
    onFiltersChange({
      ...filters,
      location: '',
      latitude: undefined,
      longitude: undefined
    });
  };

  const handleAssetTypeChange = (value: string) => {
    onFiltersChange({ ...filters, assetType: value as FilterOptions['assetType'] });
  };

  const handleSwapTypeChange = (value: string) => {
    onFiltersChange({ ...filters, swapType: value as FilterOptions['swapType'] });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleRadiusChange = (value: number[]) => {
    onFiltersChange({ ...filters, radius: value[0] });
  };

  const clearFilters = () => {
    onFiltersChange({
      location: '',
      latitude: undefined,
      longitude: undefined,
      assetType: 'all',
      swapType: 'all',
      priceRange: [0, 1000000],
      radius: 50
    });
  };

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <span>Filters</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>
      
      {isOpen && (
        <Card className="mt-2">
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                onLocationClear={handleLocationClear}
                placeholder="Search for location..."
                initialValue={filters.location}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Search Radius: {filters.radius} km
              </label>
              <Slider
                value={[filters.radius]}
                onValueChange={handleRadiusChange}
                max={200}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Asset Type</label>
              <Select value={filters.assetType} onValueChange={handleAssetTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="home">Homes</SelectItem>
                  <SelectItem value="car">Cars</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Swap Type</label>
              <Select value={filters.swapType} onValueChange={handleSwapTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Price Range: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={handlePriceRangeChange}
                max={1000000}
                min={0}
                step={10000}
                className="w-full"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchFilters;