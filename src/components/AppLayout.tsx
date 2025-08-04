import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import SwipeInterface from './SwipeInterface';
import CreateListing from './CreateListing';
import MatchesList from './MatchesList';
import ChatInterface from './ChatInterface';
import { NotificationsPage } from './NotificationsPage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import AuthModal from './AuthModal';
import LoadingScreen from './LoadingScreen';
import { Asset, Match, Like } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar, userLocation, locationLoading, addAsset } = useAppContext();
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [currentView, setCurrentView] = useState('swipe');
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Add loading timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        if (loading) {
          setLoadingError('Loading is taking longer than expected. Please refresh the page.');
        }
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Reset profile view when user changes or when navigating away from profile
  useEffect(() => {
    if (currentView !== 'profile') {
      setProfileUserId(null);
    }
  }, [currentView]);

  // Reset profile when user changes
  useEffect(() => {
    setProfileUserId(null);
  }, [user?.id]);

  useEffect(() => {
    if (location.state?.likeAsset) {
      handleLike(location.state.likeAsset);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLike = async (assetId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('handle-match-detection', {
        body: {
          userId: user.id,
          assetId: assetId
        }
      });
      
      if (error) throw error;
      
      const newLike: Like = {
        id: `like-${Date.now()}`,
        userId: user.id,
        assetId,
        createdAt: new Date()
      };
      setLikes(prev => [...prev, newLike]);
      
      if (data?.isMatch) {
        toast({
          title: "It's a match! 🎉",
          description: "You both liked each other's assets!"
        });
      } else {
        toast({
          title: "Asset liked!",
          description: "We'll notify you if there's a match."
        });
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to like asset. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePass = (assetId: string) => {
    // Just skip for now
  };

  const handleCreateListing = (assetData: Omit<Asset, 'id' | 'userId' | 'createdAt'>) => {
    addAsset(assetData);
    setCurrentView('swipe');
  };

  const handleChatOpen = (matchId: string) => {
    setActiveChatMatchId(matchId);
    setCurrentView('chat');
  };

  const handleChatBack = () => {
    setActiveChatMatchId(null);
    setCurrentView('matches');
  };

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleViewUserProfile = (userId: string) => {
    console.log('AppLayout: Navigating to user profile:', userId);
    setProfileUserId(userId);
    setCurrentView('profile');
  };

  const handleNavigateToOwnProfile = () => {
    console.log('AppLayout: Navigating to own profile');
    setProfileUserId(null); // Reset to show own profile
    setCurrentView('profile');
  };

  const handleViewChange = (view: string) => {
    // Reset profile user when navigating to profile view without specific user
    if (view === 'profile' && currentView !== 'profile') {
      setProfileUserId(null);
    }
    setCurrentView(view);
  };

  const handleForceSkipLoading = () => {
    setLoadingError(null);
    // Force continue without auth
    console.log('Force skipping loading state');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'swipe':
        return (
          <SwipeInterface
            onLike={handleLike}
            onPass={handlePass}
          />
        );
      case 'create':
        return <CreateListing onSubmit={handleCreateListing} />;
      case 'matches':
        return (
          <MatchesList
            onChatOpen={handleChatOpen}
          />
        );
      case 'chat':
        return activeChatMatchId ? (
          <ChatInterface
            matchId={activeChatMatchId}
            onBack={handleChatBack}
          />
        ) : (
          <div className="text-center p-8">
            <p>No chat selected</p>
          </div>
        );
      case 'notifications':
        return (
          <NotificationsPage 
            onViewUserProfile={handleViewUserProfile}
            onNavigateToProfile={handleNavigateToOwnProfile}
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            onNavigateToCreate={() => setCurrentView('create')} 
            userId={profileUserId || undefined}
          />
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  if (loading && !loadingError) {
    return (
      <LoadingScreen>
        <div className="mt-8">
          <button 
            onClick={handleForceSkipLoading}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Taking too long? Click to continue
          </button>
        </div>
      </LoadingScreen>
    );
  }

  if (loadingError) {
    return (
      <LoadingScreen>
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-gray-600 text-sm">{loadingError}</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              Refresh Page
            </button>
            <button 
              onClick={handleForceSkipLoading}
              className="text-blue-600 hover:text-blue-800 underline text-sm block"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </LoadingScreen>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-center">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68794542f32439e209e49d32_1753489451678_9a9bec0d.png" 
            alt="SwapMate Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
      </header>
      
      <main className="p-4 pb-20">
        {renderContent()}
      </main>
      
      <Navigation 
        currentView={currentView} 
        onViewChange={handleViewChange}
        onAuthClick={handleAuthClick}
      />
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default AppLayout;