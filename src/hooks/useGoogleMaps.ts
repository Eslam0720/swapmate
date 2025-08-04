import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GoogleMapsPlace {
  name: string;
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading - in real implementation this would check if Google Maps is available
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const searchPlaces = async (query: string): Promise<GoogleMapsPlace[]> => {
    if (!isLoaded || query.length < 2) {
      return [];
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: {
          action: 'autocomplete',
          params: { input: query }
        }
      });

      if (error) {
        console.error('Google Maps API error:', error);
        return [];
      }

      if (data && data.predictions) {
        return data.predictions.map((prediction: any) => ({
          name: prediction.structured_formatting?.main_text || prediction.description,
          formatted_address: prediction.description,
          place_id: prediction.place_id,
          geometry: {
            location: { lat: 0, lng: 0 } // Will be filled by getPlaceDetails
          }
        }));
      }

      return [];
    } catch (err) {
      console.error('Search places error:', err);
      return [];
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<GoogleMapsPlace | null> => {
    if (!isLoaded) {
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: {
          action: 'place_details',
          params: { placeId }
        }
      });

      if (error || !data || !data.result) {
        console.error('Place details error:', error);
        return null;
      }

      const place = data.result;
      return {
        name: place.name || '',
        formatted_address: place.formatted_address || '',
        place_id: place.place_id || '',
        geometry: {
          location: {
            lat: place.geometry?.location?.lat || 0,
            lng: place.geometry?.location?.lng || 0
          }
        }
      };
    } catch (err) {
      console.error('Get place details error:', err);
      return null;
    }
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!isLoaded) {
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: {
          action: 'geocode',
          params: { address }
        }
      });

      if (error || !data || !data.results || data.results.length === 0) {
        console.error('Geocode error:', error);
        return null;
      }

      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    } catch (err) {
      console.error('Geocode address error:', err);
      return null;
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    if (!isLoaded) {
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: {
          action: 'reverse_geocode',
          params: { lat, lng }
        }
      });

      if (error || !data || !data.results || data.results.length === 0) {
        console.error('Reverse geocode error:', error);
        return null;
      }

      return data.results[0].formatted_address;
    } catch (err) {
      console.error('Reverse geocode error:', err);
      return null;
    }
  };

  return {
    isLoaded,
    error,
    searchPlaces,
    getPlaceDetails,
    geocodeAddress,
    reverseGeocode
  };
};