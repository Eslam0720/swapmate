import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationSearch } from '@/components/LocationSearch';
import { Asset } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EditListingModalProps {
  listing: Asset;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  isOpen,
  onClose,
  onUpdate
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description,
    location: listing.location,
    price: listing.price?.toString() || '',
    type: listing.type
  });
  const [locationCoords, setLocationCoords] = useState<{lat: number; lng: number} | null>(null);

  useEffect(() => {
    setFormData({
      title: listing.title,
      description: listing.description,
      location: listing.location,
      price: listing.price?.toString() || '',
      type: listing.type
    });
    setLocationCoords(listing.latitude && listing.longitude ? 
      { lat: listing.latitude, lng: listing.longitude } : null);
  }, [listing]);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData({ ...formData, location: location.address });
    setLocationCoords({ lat: location.lat, lng: location.lng });
  };

  const handleLocationClear = () => {
    setFormData({ ...formData, location: '' });
    setLocationCoords(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: formData.price ? parseFloat(formData.price) : null,
        type: formData.type
      };

      if (locationCoords) {
        updateData.latitude = locationCoords.lat;
        updateData.longitude = locationCoords.lng;
      }

      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', listing.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Listing updated successfully'
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update listing',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'home' | 'car' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="car">Car</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              onLocationClear={handleLocationClear}
              placeholder="Search for a location..."
              initialValue={formData.location}
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Enter price"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Listing
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};