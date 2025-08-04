import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from '@/components/ui/use-toast';

export const PushNotificationSetup = () => {
  const { isSupported, permission, requestPermission, subscribeToNotifications } = usePushNotifications();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribeToNotifications();
        toast({
          title: 'Notifications enabled!',
          description: 'You will now receive push notifications for likes and matches.'
        });
      } else {
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable notifications. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified instantly when someone likes your items or you get a match!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permission === 'granted' ? (
          <div className="text-green-600 font-medium">
            ✓ Push notifications are enabled
          </div>
        ) : (
          <Button 
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};