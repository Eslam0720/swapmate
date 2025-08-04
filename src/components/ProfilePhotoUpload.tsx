import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { toast } from '@/hooks/use-toast';

interface ProfilePhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpdate: (photoUrl: string) => void;
  currentPhotoUrl?: string;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  isOpen,
  onClose,
  onPhotoUpdate,
  currentPhotoUrl
}) => {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      console.log('Uploading file:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('asset-images')
        .upload(fileName, selectedFile, {
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('asset-images')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Update user profile with photo URL using the async updateUser method
      await updateUser({ profile_photo_url: publicUrl });
      
      console.log('Profile photo updated successfully');
      onPhotoUpdate(publicUrl);
      toast({
        title: "Success",
        description: "Profile photo updated successfully"
      });
      onClose();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to update profile photo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;

    setUploading(true);
    try {
      console.log('Removing profile photo');
      
      // Update user profile using the async updateUser method
      await updateUser({ profile_photo_url: null });
      
      console.log('Profile photo removed successfully');
      onPhotoUpdate('');
      toast({
        title: "Success",
        description: "Profile photo removed successfully"
      });
      onClose();
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: "Failed to remove profile photo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={previewUrl || currentPhotoUrl} />
            <AvatarFallback className="text-2xl">
              <Camera className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col space-y-2 w-full">
            <label htmlFor="photo-upload">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Photo
                </span>
              </Button>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile && (
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Save Photo'}
              </Button>
            )}

            {currentPhotoUrl && (
              <Button 
                variant="destructive" 
                onClick={handleRemovePhoto}
                disabled={uploading}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Photo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};