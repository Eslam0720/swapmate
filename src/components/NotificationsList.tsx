import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Bell, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/components/AuthProvider';

interface NotificationsListProps {
  onViewUserListings: (userId: string) => void;
  onNavigateToProfile?: () => void;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({ 
  onViewUserListings, 
  onNavigateToProfile 
}) => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch } = useNotifications();
  const { user } = useAuth();
  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (user && !initialLoadRef.current) {
      initialLoadRef.current = true;
      const timer = setTimeout(() => {
        refetch();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [user, refetch]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'match':
        return <Users className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    const isValidUUID = (id: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(id);
    };
    
    const targetUserId = notification.sender_id && 
                        notification.sender_id !== user?.id && 
                        isValidUUID(notification.sender_id)
                        ? notification.sender_id 
                        : null;
    
    markAsRead(notification.id);
    
    if (targetUserId) {
      onViewUserListings(targetUserId);
    } else if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Please sign in</h3>
        <p className="text-sm">Sign in to view your notifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Notifications</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{unreadCount} new</Badge>
          <Button size="sm" variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
          <p className="text-sm">When someone likes your listings, you'll see them here.</p>
        </div>
      ) : (
        notifications.map((notification) => {
          return (
            <Card 
              key={notification.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                !notification.read ? 'border-blue-200 bg-blue-50' : 'bg-white'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <Badge variant="default" className="text-xs">New</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};