import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, MessageCircle, User, Settings, Bell, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onAuthClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, onAuthClick }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  
  const navItems = [
    { id: 'swipe', icon: Home, label: 'Swipe' },
    { id: 'create', icon: Plus, label: 'Create' },
    { id: 'matches', icon: MessageCircle, label: 'Matches' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      container.dataset.startX = touch.clientX.toString();
      container.dataset.scrollLeft = container.scrollLeft.toString();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!container.dataset.startX) return;
      
      const touch = e.touches[0];
      const startX = parseInt(container.dataset.startX);
      const scrollLeft = parseInt(container.dataset.scrollLeft || '0');
      const diff = startX - touch.clientX;
      
      container.scrollLeft = scrollLeft + diff;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 shadow-lg overflow-hidden">
      <div 
        ref={scrollContainerRef}
        className="flex items-center space-x-2 overflow-x-auto scrollbar-hide max-w-full"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          overscrollBehaviorX: 'contain'
        }}
      >
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 flex-shrink-0 min-w-[60px]"
            onClick={onAuthClick}
          >
            <LogIn className="w-5 h-5" />
            <span className="text-xs whitespace-nowrap">Login</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 flex-shrink-0 min-w-[60px]"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs whitespace-nowrap">Logout</span>
          </Button>
        )}
        {navItems.map(({ id, icon: Icon, label, badge }) => (
          <Button
            key={id}
            variant={currentView === id ? 'default' : 'ghost'}
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 flex-shrink-0 min-w-[60px] relative"
            onClick={() => onViewChange(id)}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge && badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {badge > 99 ? '99+' : badge}
                </Badge>
              )}
            </div>
            <span className="text-xs whitespace-nowrap">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;