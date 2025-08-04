import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'apikey': supabaseKey
    }
  }
});

// Enhanced auth state management
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state change:', event, session?.user?.id);
  if (event === 'SIGNED_IN' && session) {
    console.log('User signed in to Supabase:', session.user.id);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out from Supabase');
  }
});

export { supabase };