import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MapPin, Search, X } from 'lucide-react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onLocationClear?: () => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  onLocationClear,
  placeholder = "Search for a location...",
  className = "",
  initialValue = ""
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialValue);
  const { isLoaded, searchPlaces, getPlaceDetails, reverseGeocode } = useGoogleMaps();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update query when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
    setSelectedAddress(initialValue);
  }, [initialValue]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!isLoaded || query.length < 2 || query === selectedAddress) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(query);
        setSuggestions(results);
        setIsSearching(false);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setIsSearching(false);
        setShowSuggestions(false);
      }
    }, 300);
  }, [query, isLoaded, searchPlaces, selectedAddress]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = async (place: any) => {
    try {
      if (place.place_id) {
        const placeDetails = await getPlaceDetails(place.place_id);
        if (placeDetails && placeDetails.geometry?.location) {
          const lat = placeDetails.geometry.location.lat;
          const lng = placeDetails.geometry.location.lng;
          const address = placeDetails.formatted_address || place.formatted_address;
          
          setSelectedAddress(address);
          setQuery(address);
          onLocationSelect({ lat, lng, address });
        }
      } else {
        const address = place.formatted_address;
        setSelectedAddress(address);
        setQuery(address);
      }
    } catch (error) {
      console.error('Error selecting place:', error);
    } finally {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude) || 'Current Location';
        setSelectedAddress(address);
        setQuery(address);
        onLocationSelect({ lat: latitude, lng: longitude, address });
        setShowSuggestions(false);
        setSuggestions([]);
        setIsSearching(false);
      });
    }
  };

  const handleClearLocation = () => {
    setQuery('');
    setSelectedAddress('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSearching(false);
    if (onLocationClear) {
      onLocationClear();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value !== selectedAddress) {
      setSelectedAddress('');
    }
    
    if (value.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      setSelectedAddress('');
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            className="pl-10 pr-10"
            disabled={!isLoaded}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearLocation}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCurrentLocation}
          disabled={!isLoaded}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
      
      {isSearching && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 p-3 text-center text-gray-500">
          Searching...
        </Card>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((place, index) => (
            <div
              key={`${place.place_id || place.name}-${index}`}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSuggestionClick(place)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">{place.name}</div>
                  <div className="text-sm text-gray-500">{place.formatted_address}</div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};