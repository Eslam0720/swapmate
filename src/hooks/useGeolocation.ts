import { useState, useEffect } from 'react';
import { LocationData } from '@/types';

interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported by this browser' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          loading: false,
          error: null
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = error.message || 'Unknown location error';
            break;
        }
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    ...state,
    refetch: getCurrentLocation
  };
};