import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Home, Car, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from './AuthProvider';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  asset1_id: string;
  asset2_id: string;
  created_at: string;
}

interface MatchesListProps {
  onChatOpen: (matchId: string) => void;
}

export const MatchesList: React.FC<MatchesListProps> = ({ onChatOpen }) => {
  const { assets, users } = useAppContext();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchMatches = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetById = (id: string) => assets.find(asset => asset.id === id);
  const getUserById = (id: string) => users.find(user => user.id === id);

  const handleDeletedAssetMatch = async (matchId: string) => {
    try {
      await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);
      
      setMatches(prev => prev.filter(match => match.id !== matchId));
    } catch (error) {
      console.error('Error deleting invalid match:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-gray-600">Please wait while we authenticate you...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-600">Loading matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
        <p className="text-gray-600">Start swiping to find your perfect match!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Your Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => {
          const asset1 = getAssetById(match.asset1_id);
          const asset2 = getAssetById(match.asset2_id);
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const otherUser = getUserById(otherUserId);
          
          if (!asset1 || !asset2) {
            return (
              <Card key={match.id} className="w-full border-red-200">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                    <h3 className="font-semibold text-red-700">Match Unavailable</h3>
                    <p className="text-sm text-red-600">One or both assets have been deleted</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletedAssetMatch(match.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Remove Match
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          }
          
          return (
            <Card key={match.id} className="w-full">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {asset1.images && asset1.images[0] && (
                          <img src={asset1.images[0]} alt={asset1.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{asset1.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {asset1.type === 'home' ? <Home className="w-3 h-3 mr-1" /> : <Car className="w-3 h-3 mr-1" />}
                          {asset1.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-center text-lg">⇄</div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {asset2.images && asset2.images[0] && (
                          <img src={asset2.images[0]} alt={asset2.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{asset2.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {asset2.type === 'home' ? <Home className="w-3 h-3 mr-1" /> : <Car className="w-3 h-3 mr-1" />}
                          {asset2.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      onClick={() => onChatOpen(match.id)}
                      className="w-full"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Matched with {otherUser?.full_name || otherUser?.email?.split('@')[0] || 'Someone'} on {new Date(match.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MatchesList;