import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  sender_name?: string;
  asset_id?: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { showNotification } = usePushNotifications();
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (user && !fetchingRef.current) {
      fetchNotifications();
      setupRealtimeSubscription();
    } else if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user || fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      
      const { data: enrichedNotifications, error } = await supabase.functions.invoke('get-notifications-with-sender', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Error fetching notifications:', error);
        const { data: notifData, error: fallbackError } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.error('Fallback query failed:', fallbackError);
          return;
        }

        if (mountedRef.current) {
          const notifications = notifData || [];
          setNotifications(notifications);
          const unread = notifications.filter(n => !n.read).length;
          setUnreadCount(unread);
          console.log('Notifications loaded (fallback):', notifications.length, 'unread:', unread);
        }
        return;
      }
      
      if (mountedRef.current && enrichedNotifications) {
        setNotifications(enrichedNotifications);
        const unread = enrichedNotifications.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
        console.log('Notifications loaded:', enrichedNotifications.length, 'unread:', unread);
      }
      
    } catch (error) {
      console.error('fetchNotifications error:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    const subscription = supabase
      .channel(`notifications-${user.id}-${Date.now()}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `recipient_id=eq.${user.id}` 
        },
        async (payload) => {
          if (mountedRef.current) {
            let newNotification = payload.new as Notification;
            
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => {
              const newCount = prev + 1;
              console.log('New notification received, unread count:', newCount);
              return newCount;
            });
            
            if (newNotification.type === 'match') {
              showNotification('🎉 Its a Match!', {
                body: newNotification.message,
                tag: 'match',
                requireInteraction: true
              });
              toast({ 
                title: '🎉 Its a Match!',
                description: newNotification.message,
                duration: 5000
              });
            } else if (newNotification.type === 'like') {
              showNotification('💖 Someone liked your item!', {
                body: newNotification.message,
                tag: 'like'
              });
              toast({ 
                title: 'New like!',
                description: newNotification.message
              });
            }
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (!error && mountedRef.current) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => {
          const newCount = Math.max(0, prev - 1);
          console.log('Marked notification as read, unread count:', newCount);
          return newCount;
        });
      }
    } catch (error) {
      console.error('markAsRead error:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false);
      
      if (!error && mountedRef.current) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        console.log('Marked all notifications as read, unread count: 0');
      }
    } catch (error) {
      console.error('markAllAsRead error:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};