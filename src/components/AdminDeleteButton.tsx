import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Asset } from '@/types';

interface AdminDeleteButtonProps {
  asset: Asset;
  onDelete?: () => void;
}

const AdminDeleteButton: React.FC<AdminDeleteButtonProps> = ({ asset, onDelete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is admin (switchapp.eg@gmail.com)
  const isAdmin = user?.email === 'switchapp.eg@gmail.com';

  if (!isAdmin) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('assets')
        .update({ is_active: false })
        .eq('id', asset.id);

      if (error) throw error;

      toast({
        title: 'Listing deleted',
        description: 'The listing has been successfully removed.',
      });

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 z-30 bg-red-600 hover:bg-red-700"
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Listing</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{asset.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminDeleteButton;