import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingScreen from './LoadingScreen';

interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  profile_photo_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  updateUser: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - setting loading to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout
    
    const getSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) setLoading(false);
          return;
        }
        
        console.log('Initial session:', session?.user?.id || 'No session');
        
        if (session?.user && mounted) {
          await loadUserProfile(session.user.id, session.user.email || '');
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (mounted) {
          clearTimeout(loadingTimeout);
          setLoading(false);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      console.log('Loading user profile for:', userId);
      
      // Create basic user first to avoid hanging
      const basicUser: User = {
        id: userId,
        email: email,
        name: email.split('@')[0] || 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(basicUser);
      
      // Try to load from database with timeout
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile load timeout')), 3000)
      );
      
      try {
        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
        
        if (profile && !error) {
          console.log('Loaded user profile from DB');
          setUser(profile);
        } else {
          console.log('Using basic user profile');
        }
      } catch (dbError) {
        console.log('Database error or timeout, using basic profile:', dbError);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user:', error);
        return;
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || ''
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        return { success: true, error: 'Please check your email to confirm your account' };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};