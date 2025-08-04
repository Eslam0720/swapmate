import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Asset } from '@/types';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import CreateListingForm from './CreateListingForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';

interface CreateListingProps {
  onSubmit: (asset: Omit<Asset, 'id' | 'userId' | 'createdAt'>) => void;
}

const CreateListing: React.FC<CreateListingProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: '' as 'home' | 'car' | 'others' | '',
    swapType: '' as 'permanent' | 'temporary' | '',
    title: '',
    description: '',
    location: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    price: '',
    phoneNumber: '',
    images: [] as string[]
  });
  
  const [listingLimits, setListingLimits] = useState({
    canCreateListing: true,
    currentListings: 0,
    maxFreeListings: 3,
    isPremium: false,
    needsUpgrade: false
  });
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [limitsLoading, setLimitsLoading] = useState(true);

  const fetchListingLimits = async () => {
    if (!user?.id) {
      setLimitsLoading(false);
      return;
    }

    try {
      setLimitsLoading(true);
      const { data: userAssets, error: assetsError } = await supabase
        .from('assets')
        .select('id')
        .eq('user_id', user.id);

      if (assetsError) {
        console.error('Error fetching user assets:', assetsError);
        return;
      }

      const currentListings = userAssets?.length || 0;
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const isPremium = !!subscription;
      const maxFreeListings = 3;
      const canCreateListing = isPremium || currentListings < maxFreeListings;
      const needsUpgrade = !isPremium && currentListings >= maxFreeListings;

      setListingLimits({
        canCreateListing,
        currentListings,
        maxFreeListings,
        isPremium,
        needsUpgrade
      });
    } catch (error) {
      console.error('Error fetching listing limits:', error);
      setListingLimits({
        canCreateListing: true,
        currentListings: 0,
        maxFreeListings: 3,
        isPremium: false,
        needsUpgrade: false
      });
    } finally {
      setLimitsLoading(false);
    }
  };

  useEffect(() => {
    fetchListingLimits();
  }, [user?.id]);

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      if (!user?.id) {
        console.error('No user ID available for upload');
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('asset-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('asset-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (!user?.id) {
      toast({ title: 'Please sign in to upload images', variant: 'destructive' });
      return;
    }
    
    setUploadingImages(true);
    
    try {
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map(file => uploadImageToStorage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (validUrls.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...validUrls]
        }));
        toast({ title: `${validUrls.length} image(s) uploaded successfully!` });
      }
      
      if (validUrls.length !== fileArray.length) {
        toast({ 
          title: 'Some images failed to upload', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error handling images:', error);
      toast({ title: 'Error uploading images', variant: 'destructive' });
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({ title: 'Please wait for authentication', variant: 'destructive' });
      return;
    }
    
    if (!listingLimits.canCreateListing) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (!formData.type || !formData.title || !formData.description || !formData.location || !formData.swapType) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    
    try {
      onSubmit({
        type: formData.type,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        price: formData.price ? parseInt(formData.price) : undefined,
        phoneNumber: formData.phoneNumber || undefined,
        images: formData.images,
        swapType: formData.swapType
      });
      
      setFormData({
        type: '',
        swapType: '',
        title: '',
        description: '',
        location: '',
        latitude: undefined,
        longitude: undefined,
        price: '',
        phoneNumber: '',
        images: []
      });
      
      setTimeout(() => {
        fetchListingLimits();
      }, 1000);
      
      toast({ title: 'Listing created successfully!' });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleUpgrade = () => {
    toast({ title: 'Upgrade feature coming soon!' });
    setShowUpgradeModal(false);
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-600">Authenticating...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Create New Listing
            {!listingLimits.isPremium && (
              <div className="text-sm text-gray-500">
                {limitsLoading ? (
                  <span>Loading...</span>
                ) : (
                  <span>{listingLimits.currentListings}/{listingLimits.maxFreeListings} free</span>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateListingForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onLocationSelect={handleLocationSelect}
            onImageUpload={handleImageUpload}
            removeImage={removeImage}
            loading={loading}
            uploadingImages={uploadingImages}
            limitsLoading={limitsLoading}
          />
        </CardContent>
      </Card>
      
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        currentListings={listingLimits.currentListings}
      />
    </>
  );
};

export default CreateListing;