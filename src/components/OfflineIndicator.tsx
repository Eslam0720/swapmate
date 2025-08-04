import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineAlert) return null;

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50 bg-orange-50 border-orange-200">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        You're currently offline. Some features may be limited.
      </AlertDescription>
    </Alert>
  );
}

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {isOnline ? (
        <Wifi className="h-3 w-3 text-green-600" />
      ) : (
        <WifiOff className="h-3 w-3 text-red-600" />
      )}
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}