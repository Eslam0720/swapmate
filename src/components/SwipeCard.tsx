import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Asset, User } from '@/types';
import { MapPin, Home, Car, CheckCircle, Clock, Calendar } from 'lucide-react';
import ImageCarousel from './ImageCarousel';
import AdminDeleteButton from './AdminDeleteButton';

interface SwipeCardProps {
  asset: Asset;
  user?: User;
  onSwipe: (direction: 'left' | 'right') => void;
  onDelete?: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ asset, user, onDelete }) => {
  const navigate = useNavigate();
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on admin delete button
    if ((e.target as HTMLElement).closest('[data-admin-delete]')) {
      return;
    }
    e.preventDefault();
    navigate(`/listing/${asset.id}`);
  };

  // Mock swap type for testing - in real app this would come from asset data
  const mockSwapType = asset.type === 'home' ? 'permanent' : 'temporary';

  return (
    <Card 
      className="w-full max-w-none mx-auto h-[28rem] relative overflow-hidden cursor-pointer shadow-lg bg-white border border-gray-200" 
      onClick={handleCardClick}
    >
      <div className="relative h-64 bg-gray-100">
        <ImageCarousel images={asset.images} title={asset.title} />
        
        {/* Admin Delete Button - top right */}
        <div data-admin-delete>
          <AdminDeleteButton asset={asset} onDelete={onDelete} />
        </div>
        
        {/* Asset type badge - top left */}
        <Badge className="absolute top-2 left-2 z-20 bg-blue-500 hover:bg-blue-600 text-white">
          {asset.type === 'home' ? <Home className="w-4 h-4 mr-1" /> : <Car className="w-4 h-4 mr-1" />}
          {asset.type}
        </Badge>
        
        {/* Purple swap type badge - top center */}
        <Badge className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 bg-purple-600 hover:bg-purple-700 text-white font-medium">
          {mockSwapType === 'permanent' ? <Calendar className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
          {mockSwapType}
        </Badge>
        
        {/* Verified badge - bottom left */}
        {user?.verified && (
          <Badge className="absolute bottom-2 left-2 bg-green-500 hover:bg-green-600 z-20 text-white">
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4 flex flex-col h-[12rem] bg-white">
        <div className="flex-1 min-h-0">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-gray-900">{asset.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-3 overflow-hidden">{asset.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{asset.location}</span>
            </div>
            {/* Distance badge moved to right side */}
            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
              2.5 km
            </Badge>
          </div>
        </div>
        {asset.price && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-lg font-bold text-green-600">${asset.price.toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SwipeCard;