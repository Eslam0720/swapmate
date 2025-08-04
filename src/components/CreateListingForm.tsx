import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { LocationSearch } from './LocationSearch';

interface FormData {
  type: 'home' | 'car' | 'others' | '';
  swapType: 'permanent' | 'temporary' | '';
  title: string;
  description: string;
  location: string;
  price: string;
  phoneNumber: string;
  images: string[];
}

interface CreateListingFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  loading: boolean;
  uploadingImages: boolean;
  limitsLoading: boolean;
}

const CreateListingForm: React.FC<CreateListingFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onLocationSelect,
  onImageUpload,
  removeImage,
  loading,
  uploadingImages,
  limitsLoading
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Asset Type</Label>
        <Select value={formData.type} onValueChange={(value: 'home' | 'car' | 'others') => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="swapType">Swap Type</Label>
        <Select value={formData.swapType} onValueChange={(value: 'permanent' | 'temporary') => setFormData(prev => ({ ...prev, swapType: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select swap type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="permanent">Permanent</SelectItem>
            <SelectItem value="temporary">Temporary</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter title"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your asset"
        />
      </div>
      
      <div>
        <Label>Location</Label>
        <LocationSearch
          onLocationSelect={onLocationSelect}
          placeholder="Search for location..."
        />
      </div>
      
      <div>
        <Label htmlFor="price">Price (optional)</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          placeholder="Enter price"
        />
      </div>
      
      <div>
        <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
        <Input
          id="phoneNumber"
          type="text"
          value={formData.phoneNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
          placeholder="Enter phone number"
        />
      </div>
      
      <div>
        <Label>Images</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.images.map((image, index) => (
            <div key={index} className="relative">
              <img src={image} alt={`Upload ${index + 1}`} className="w-16 h-16 object-cover rounded" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={onImageUpload}
          className="hidden"
          id="image-upload"
          disabled={uploadingImages}
        />
        <Label 
          htmlFor="image-upload" 
          className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Camera className="w-4 h-4 mr-2" />
          {uploadingImages ? 'Uploading...' : 'Add Photos'}
        </Label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || uploadingImages || limitsLoading}
      >
        {loading ? 'Creating...' : 'Create Listing'}
      </Button>
    </form>
  );
};

export default CreateListingForm;