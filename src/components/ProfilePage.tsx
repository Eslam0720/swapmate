import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Asset } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import LikeButton from './LikeButton';
import { useNavigate } from 'react-router-dom';
import { EditListingModal } from './EditListingModal';
import { DeleteListingModal } from './DeleteListingModal';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import ProfilePageMain from './ProfilePageMain';

interface ProfilePageProps {
  onNavigateToCreate?: () => void;
  userId?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateToCreate, userId }) => {
  const { refreshAssets, users } = useAppContext();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [userListings, setUserListings] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Asset | null>(null);
  const [deletingListing, setDeletingListing] = useState<{ id: string; title: string } | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUser = userId ? users.find(u => u.id === userId) : currentUser;

  const loadUserData = async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Load profile photo - use currentUser.profile_photo_url if available for own profile
      let photoUrl = '';
      if (isOwnProfile && currentUser?.profile_photo_url) {
        photoUrl = currentUser.profile_photo_url;
      } else {
        const { data: userData } = await supabase
          .from('users')
          .select('profile_photo_url')
          .eq('id', targetUserId)
          .single();
        
        photoUrl = userData?.profile_photo_url || '';
      }
      
      setProfilePhotoUrl(photoUrl);
      
      // Get user's listings from assets table
      const { data: userAssets, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching user listings:', error);
        setUserListings([]);
        return;
      }
      
      const formattedAssets: Asset[] = (userAssets || []).map(asset => ({
        id: asset.id,
        userId: asset.user_id,
        user_id: asset.user_id,
        type: asset.type,
        title: asset.title,
        description: asset.description,
        location: asset.location,
        latitude: parseFloat(asset.latitude),
        longitude: parseFloat(asset.longitude),
        price: asset.price,
        images: asset.images || [],
        createdAt: new Date(asset.created_at)
      }));
      
      setUserListings(formattedAssets);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [targetUserId, currentUser?.profile_photo_url]);

  const handleListingClick = (listingId: string, e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.action-buttons')) {
      navigate(`/listing/${listingId}`);
    }
  };

  const handleEditListing = (listing: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingListing(listing);
  };

  const handleDeleteListing = (listing: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingListing({ id: listing.id, title: listing.title });
  };

  const handleUpdateComplete = () => {
    loadUserData();
    refreshAssets();
  };

  const handlePhotoUpdate = (newPhotoUrl: string) => {
    setProfilePhotoUrl(newPhotoUrl);
  };

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-4 py-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        <ProfilePageMain
          onNavigateToCreate={onNavigateToCreate}
          userId={userId}
          profileUser={profileUser}
          isOwnProfile={isOwnProfile}
          onShowPhotoUpload={() => setShowPhotoUpload(true)}
          profilePhotoUrl={profilePhotoUrl}
        />

        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold">
              {isOwnProfile ? 'My Listings' : 'Listings'} ({userListings.length})
            </h2>
            {isOwnProfile && (
              <Button onClick={onNavigateToCreate} size="sm" className="w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Add Listing
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading listings...</p>
            </div>
          ) : userListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow w-full cursor-pointer relative" onClick={(e) => handleListingClick(listing.id, e)}>
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={listing.images[0] || '/placeholder.svg'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    {!isOwnProfile && (
                      <LikeButton 
                        assetId={listing.id}
                        ownerId={listing.user_id}
                      />
                    )}
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="font-semibold truncate text-sm sm:text-base">{listing.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">{listing.location}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm sm:text-lg font-bold text-green-600 truncate">
                        {listing.price ? `$${listing.price.toLocaleString()}` : 'Price not set'}
                      </span>
                      <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                        {listing.type}
                      </Badge>
                    </div>
                    {isOwnProfile && (
                      <div className="action-buttons flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleEditListing(listing, e)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDeleteListing(listing, e)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="w-full">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Plus className="h-12 w-12 mx-auto mb-2" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isOwnProfile ? 'No listings yet' : 'No listings available'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isOwnProfile ? 'Start by creating your first listing' : 'This user has no listings yet'}
                </p>
                {isOwnProfile && (
                  <Button onClick={onNavigateToCreate}>
                    Create Your First Listing
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {editingListing && (
        <EditListingModal
          listing={editingListing}
          isOpen={!!editingListing}
          onClose={() => setEditingListing(null)}
          onUpdate={handleUpdateComplete}
        />
      )}

      {deletingListing && (
        <DeleteListingModal
          listingId={deletingListing.id}
          listingTitle={deletingListing.title}
          isOpen={!!deletingListing}
          onClose={() => setDeletingListing(null)}
          onDelete={handleUpdateComplete}
        />
      )}

      {showPhotoUpload && (
        <ProfilePhotoUpload
          isOpen={showPhotoUpload}
          onClose={() => setShowPhotoUpload(false)}
          onPhotoUpdate={handlePhotoUpdate}
          currentPhotoUrl={profilePhotoUrl}
        />
      )}
    </div>
  );
};

export default ProfilePage;