import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Settings, Plus, LogOut, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';

interface ProfilePageMainProps {
  onNavigateToCreate?: () => void;
  userId?: string;
  profileUser: any;
  isOwnProfile: boolean;
  onShowPhotoUpload: () => void;
  profilePhotoUrl: string;
}

const ProfilePageMain: React.FC<ProfilePageMainProps> = ({
  onNavigateToCreate,
  profileUser,
  isOwnProfile,
  onShowPhotoUpload,
  profilePhotoUrl
}) => {
  const { signOut } = useAuth();
  const [isSubscriber, setIsSubscriber] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!profileUser?.id) return;
      
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', profileUser.id)
        .eq('status', 'active')
        .single();
      
      setIsSubscriber(!!subscription);
    };

    loadSubscription();
  }, [profileUser?.id]);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      onShowPhotoUpload();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-shrink-0">
            <Avatar 
              className={`h-16 w-16 sm:h-20 sm:w-20 ${isOwnProfile ? 'cursor-pointer' : ''}`}
              onClick={handleAvatarClick}
            >
              <AvatarImage src={profilePhotoUrl} />
              <AvatarFallback className="text-lg">
                {getInitials(profileUser.email || 'U')}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold break-words overflow-wrap-anywhere">
                {profileUser.name || profileUser.email || 'User'}
              </h1>
              {isSubscriber && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 w-fit flex-shrink-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm sm:text-base break-words overflow-wrap-anywhere">
              @{profileUser.username || profileUser.email}
            </p>
            {isSubscriber && (
              <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white w-fit flex-shrink-0">
                Premium Member
              </Badge>
            )}
          </div>
          
          {isOwnProfile && (
            <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs sm:text-sm">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePageMain;