import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, DollarSign, Clock, Calendar } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/AuthProvider';
import LikeButton from './LikeButton';

interface UserListingsProps {
  userId: string;
  onBack: () => void;
}

export const UserListings: React.FC<UserListingsProps> = ({ userId, onBack }) => {
  const { assets, users } = useAppContext();
  const { user: currentUser } = useAuth();
  
  const user = users.find(u => u.id === userId);
  const userAssets = assets.filter(asset => asset.user_id === userId);
  const isOwnProfile = currentUser?.id === userId;

  if (!user) {
    return (
      <div className="p-4">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <p>User not found</p>
      </div>
    );
  }

  const displayName = user.full_name || user.name || user.email?.split('@')[0] || 'User';

  return (
    <div className="p-4">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Notifications
      </Button>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold">{displayName}'s Listings</h2>
        <p className="text-gray-600">{user.email}</p>
        {user.verified && (
          <Badge variant="secondary" className="mt-2">
            Verified
          </Badge>
        )}
      </div>

      {userAssets.length === 0 ? (
        <p className="text-gray-500">This user has no listings yet.</p>
      ) : (
        <div className="space-y-4">
          {userAssets.map((asset) => {
            // Mock swap type for testing - in real app this would come from asset data
            const mockSwapType = asset.type === 'home' ? 'permanent' : 'temporary';
            
            return (
              <Card key={asset.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex-1">{asset.title}</CardTitle>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant={asset.type === 'home' ? 'default' : 'secondary'}>
                        {asset.type === 'home' ? 'Home' : 'Car'}
                      </Badge>
                      <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
                        {mockSwapType === 'permanent' ? <Calendar className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {mockSwapType}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm">{asset.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {asset.location}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        1.8 km
                      </Badge>
                    </div>
                    
                    {asset.price && (
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {asset.price.toLocaleString()}
                      </div>
                    )}
                    
                    <div className="mt-4 relative">
                      {asset.images && asset.images.length > 0 ? (
                        <img
                          src={asset.images[0]}
                          alt={asset.title}
                          className="w-full h-48 object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-500">No image available</span>
                        </div>
                      )}
                      
                      {currentUser && !isOwnProfile && (
                        <LikeButton 
                          assetId={asset.id}
                          ownerId={asset.user_id}
                        />
                      )}
                      
                      {!currentUser && (
                        <LikeButton 
                          assetId={asset.id}
                          ownerId={asset.user_id}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};