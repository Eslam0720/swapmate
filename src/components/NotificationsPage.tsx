import React from 'react';
import { NotificationsList } from '@/components/NotificationsList';
import { useAuth } from '@/components/AuthProvider';
import { Bell } from 'lucide-react';

interface NotificationsPageProps {
  onViewUserProfile?: (userId: string) => void;
  onNavigateToProfile?: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ 
  onViewUserProfile, 
  onNavigateToProfile 
}) => {
  const { user } = useAuth();

  const handleViewUserListings = (userId: string) => {
    if (onViewUserProfile) {
      onViewUserProfile(userId);
    }
  };

  const handleNavigateToProfile = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8 bg-white rounded-lg">
        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-bold mb-2">Sign in to view notifications</h2>
        <p className="text-gray-600">Please sign in to see your notifications and matches.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationsList 
        onViewUserListings={handleViewUserListings} 
        onNavigateToProfile={handleNavigateToProfile}
      />
    </div>
  );
};