import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface LikeButtonProps {
  assetId: string;
  ownerId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ assetId, ownerId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkLikeStatus();
  }, [user?.id, assetId]);

  const getStorageKey = () => {
    return user?.id ? `like_${assetId}_${user.id}` : `like_${assetId}_anonymous`;
  };

  const checkLikeStatus = async () => {
    const storageKey = getStorageKey();
    const localLiked = localStorage.getItem(storageKey) === 'true';
    
    if (!user?.id) {
      setIsLiked(localLiked);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('asset_id', assetId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        setIsLiked(localLiked);
        return;
      }
      
      const dbLiked = !!data;
      setIsLiked(dbLiked);
      localStorage.setItem(storageKey, dbLiked.toString());
    } catch (error) {
      console.error('Error checking like status:', error);
      setIsLiked(localLiked);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.id) {
      const newState = !isLiked;
      setIsLiked(newState);
      localStorage.setItem(getStorageKey(), newState.toString());
      
      if (newState) {
        toast({ title: 'Liked! Sign in to save permanently' });
      }
      return;
    }

    if (user.id === ownerId) {
      toast({ title: 'You cannot like your own listing', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const previousState = isLiked;
    const newState = !isLiked;
    setIsLiked(newState);
    localStorage.setItem(getStorageKey(), newState.toString());
    
    try {
      if (previousState) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('asset_id', assetId);
          
        if (error) throw error;
      } else {
        const { error: insertError } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            asset_id: assetId,
            owner_id: ownerId
          });
          
        if (insertError) throw insertError;
        
        // Get asset title and trigger notifications
        const { data: asset } = await supabase
          .from('assets')
          .select('title')
          .eq('id', assetId)
          .single();
        
        try {
          await supabase.functions.invoke('handle-like-notification', {
            body: {
              userId: user.id,
              assetId: assetId,
              assetOwnerId: ownerId,
              assetTitle: asset?.title || 'Unknown'
            }
          });
          
          await supabase.functions.invoke('handle-match-detection', {
            body: {
              liker_id: user.id,
              asset_id: assetId,
              owner_id: ownerId
            }
          });
        } catch (notifError) {
          console.error('Error sending notifications:', notifError);
        }
      }
      
    } catch (error) {
      console.error('Error handling like:', error);
      setIsLiked(previousState);
      localStorage.setItem(getStorageKey(), previousState.toString());
      toast({ title: 'Error updating like', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isLiked ? 'default' : 'outline'}
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className={`absolute bottom-4 right-4 z-10 transition-all ${
        isLiked ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/90 hover:bg-white'
      }`}
    >
      <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
      {loading ? '...' : isLiked ? 'Liked' : 'Like'}
    </Button>
  );
};

export default LikeButton;