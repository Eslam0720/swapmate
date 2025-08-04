import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Home, Car, CheckCircle, ImageIcon, Clock, Calendar } from 'lucide-react';
import { Asset, User } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';
import LikeButton from '@/components/LikeButton';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, users } = useAppContext();
  const { user: currentUser } = useAuth();
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  
  const asset = assets.find(a => a.id === id);
  const user = asset ? users.find(u => u.id === asset.userId) : undefined;
  
  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Listing not found</h1>
        </div>
      </div>
    );
  }
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };
  
  const isOwnListing = currentUser?.id === asset.userId;
  
  // Mock swap type for testing - in real app this would come from asset data
  const mockSwapType = asset.type === 'home' ? 'permanent' : 'temporary';
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 bg-white border-b p-4 z-10">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="p-4 max-w-2xl mx-auto">
        {/* Image Gallery */}
        <div className="mb-6">
          {asset.images && asset.images.length > 0 ? (
            asset.images.map((image, index) => (
              <div key={index} className="mb-4">
                {imageErrors[index] ? (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Image not available</p>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={image} 
                    alt={`${asset.title} - ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={() => handleImageError(index)}
                    loading="lazy"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">No images available</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Listing Details */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge>
                {asset.type === 'home' ? <Home className="w-4 h-4 mr-1" /> : <Car className="w-4 h-4 mr-1" />}
                {asset.type}
              </Badge>
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
                {mockSwapType === 'permanent' ? <Calendar className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
                {mockSwapType}
              </Badge>
              {user?.verified && (
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge variant="outline" className="ml-auto">
                2.1 km away
              </Badge>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">{asset.title}</h1>
            
            {asset.price && (
              <p className="text-3xl font-bold text-green-600 mb-4">
                ${asset.price.toLocaleString()}
              </p>
            )}
            
            <div className="flex items-center text-gray-600 mb-6">
              <MapPin className="w-4 h-4 mr-2" />
              {asset.location}
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{asset.description}</p>
            </div>
            
            {user && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Listed by</h3>
                <div className="flex items-center">
                  {user.avatar && (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <div>
                    <p className="font-medium">{user.name}</p>
                    {user.location && (
                      <p className="text-sm text-gray-600">{user.location}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Fixed Like Button at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-2xl mx-auto">
          {isOwnListing ? (
            <div className="text-center py-4">
              <p className="text-gray-600">This is your own listing</p>
            </div>
          ) : (
            <LikeButton 
              assetId={asset.id}
              ownerId={asset.userId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;