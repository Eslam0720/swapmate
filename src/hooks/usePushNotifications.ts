import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;
    
    try {
      new Notification(title, {
        icon: '/placeholder.svg',
        badge: '/placeholder.svg',
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const subscribeToNotifications = async () => {
    if (!user || !isSupported || permission !== 'granted') return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HcCWLrMjhBXAuCLXL2dw4BmNlfRYjuBTLiHkp3RvQDj-BvR_BcHI2EE3oI'
      });
      
      // Store subscription in database
      await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: JSON.stringify(subscription),
          endpoint: subscription.endpoint
        });
        
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    subscribeToNotifications
  };
};