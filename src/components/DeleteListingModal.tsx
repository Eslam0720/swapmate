import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DeleteListingModalProps {
  listingId: string;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteListingModal: React.FC<DeleteListingModalProps> = ({
  listingId,
  listingTitle,
  isOpen,
  onClose,
  onDelete
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      // Soft delete - set is_active to false instead of actually deleting
      // This preserves the listing count for premium subscriptions
      const { error } = await supabase
        .from('assets')
        .update({ is_active: false })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Listing deleted successfully'
      });

      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Listing</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{listingTitle}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};