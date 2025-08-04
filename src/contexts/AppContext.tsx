import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Asset, User } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { sortByDistance, calculateDistance } from '@/utils/location';
import { FilterOptions } from '@/components/SearchFilters';
import { SortOption } from '@/components/SortOptions';
import { sortAssets } from '@/utils/sorting';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  assets: Asset[];
  users: User[];
  currentUser: User | null;
  userLocation: { latitude: number; longitude: number } | null;
  locationLoading: boolean;
  locationError: string | null;
  getSortedAssets: () => Asset[];
  getFilteredAssets: (filters: FilterOptions, sortBy?: SortOption) => Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  refreshAssets: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const refreshAssets = async () => {
    try {
      const { data: assetsData, error } = await supabase
        .from('assets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading assets:', error);
        return;
      }

      if (!assetsData) {
        setAssets([]);
        return;
      }

      const processedAssets = await Promise.all(
        assetsData.map(async (asset) => {
          const processedImages = [];
          if (asset.images && asset.images.length > 0) {
            for (const imagePath of asset.images) {
              if (imagePath.startsWith('http')) {
                processedImages.push(imagePath);
              } else {
                const { data } = supabase.storage
                  .from('asset-images')
                  .getPublicUrl(imagePath);
                processedImages.push(data.publicUrl);
              }
            }
          }
          
          return {
            id: asset.id,
            userId: asset.user_id,
            user_id: asset.user_id,
            type: asset.type,
            title: asset.title,
            description: asset.description,
            location: asset.location,
            latitude: parseFloat(asset.latitude) || 0,
            longitude: parseFloat(asset.longitude) || 0,
            price: asset.price,
            images: processedImages,
            swapType: asset.swap_type || 'permanent',
            createdAt: new Date(asset.created_at)
          };
        })
      );

      setAssets(processedAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
      setAssets([]);
    }
  };

  const refreshUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      if (!usersData) {
        setUsers([]);
        return;
      }

      const formattedUsers: User[] = usersData.map(user => ({
        id: user.id,
        name: user.full_name || user.email?.split('@')[0] || 'User',
        full_name: user.full_name,
        email: user.email,
        verified: user.verified || false,
        isPremium: user.is_premium || false
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([refreshAssets(), refreshUsers()]);
    };
    
    initializeData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const getSortedAssets = () => {
    return location ? sortByDistance(assets, location) : assets;
  };

  const getFilteredAssets = (filters: FilterOptions, sortBy: SortOption = 'most-relevant') => {
    let filtered = assets;

    if (authUser?.id) {
      filtered = filtered.filter(asset => asset.user_id !== authUser.id);
    }

    if (filters.assetType !== 'all') {
      filtered = filtered.filter(asset => asset.type === filters.assetType);
    }

    if (filters.swapType !== 'all') {
      filtered = filtered.filter(asset => asset.swapType === filters.swapType);
    }

    filtered = filtered.filter(asset => {
      const price = asset.price || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    if (filters.latitude && filters.longitude) {
      filtered = filtered.filter(asset => {
        if (!asset.latitude || !asset.longitude) return false;
        const distance = calculateDistance(
          { latitude: filters.latitude!, longitude: filters.longitude! },
          { latitude: asset.latitude, longitude: asset.longitude }
        );
        return distance <= filters.radius;
      });
    }

    const referenceLocation = (filters.latitude && filters.longitude) 
      ? { latitude: filters.latitude, longitude: filters.longitude }
      : location;
    
    return sortAssets(filtered, sortBy, referenceLocation, users);
  };

  const addAsset = async (assetData: Omit<Asset, 'id' | 'userId' | 'createdAt'>) => {
    if (!authUser?.id) {
      toast({ title: 'Please sign in to create a listing', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase
        .from('assets')
        .insert({
          user_id: authUser.id,
          type: assetData.type,
          title: assetData.title,
          description: assetData.description,
          location: assetData.location,
          latitude: assetData.latitude,
          longitude: assetData.longitude,
          price: assetData.price,
          images: assetData.images,
          swap_type: assetData.swapType || 'permanent',
          is_active: true
        });

      if (error) throw error;
      
      await refreshAssets();
      toast({ title: 'Listing created successfully!' });
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({ title: 'Error creating listing', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (authUser) {
      const existingUser = users.find(u => u.id === authUser.id);
      if (existingUser) {
        setCurrentUser(existingUser);
      } else {
        const newUser: User = {
          id: authUser.id,
          name: authUser.full_name || authUser.email?.split('@')[0] || 'User',
          full_name: authUser.full_name,
          email: authUser.email || '',
          verified: true,
          isPremium: false
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
      }
    } else {
      setCurrentUser(null);
    }
  }, [authUser, users]);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        assets,
        users,
        currentUser,
        userLocation: location,
        locationLoading,
        locationError,
        getSortedAssets,
        getFilteredAssets,
        addAsset,
        refreshAssets
      }}
    >
      {children}
    </AppContext.Provider>
  );
};