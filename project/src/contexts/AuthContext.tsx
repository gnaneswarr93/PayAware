import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, phone?: string, initialBalance?: number) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithPhone: (phone: string, password: string) => Promise<any>;
  loginWithDemo: () => Promise<any>;
}

const getRedirectUrl = () => {
  // 1. Prefer explicitly defined site URL
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL;
  }

  // 2. Handle Capacitor environments (Mobile App)
  // Capacitor usually uses http://localhost or capacitor://localhost
  const isCapacitor = window.location.origin.includes('capacitor://') || 
                     (window.location.origin.includes('http://localhost') && window.navigator.userAgent.includes('Capacitor'));
  
  if (isCapacitor) {
    // If we're in the app, we probably want to redirect to the live site 
    // or a deep link. For now, we'll suggest using a production URL.
    return 'https://payaware.io'; // Placeholder - user should override via VITE_SITE_URL
  }

  // 3. Fallback to current origin (works for Ngrok, Dev Tunnels, Local Network)
  return window.location.origin;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setLoading(false);
      } else {
        // No session found, stop loading.
        // This will cause the UI to show the Login screen (Auth.tsx)
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session?.user) {
         setUser(session.user);
      } else {
         setUser(currentUser => {
             // If we are currently the demo user, don't log out just because Supabase has no session
             if (currentUser?.id === 'demo-user-id') return currentUser;
             return null;
         });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, phone?: string, initialBalance?: number) => {
    const redirectUrl = getRedirectUrl();
    console.log("🚀 DEBUG: Supabase Email Redirect URL:", redirectUrl); // Check this in your browser console!

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          initial_balance: initialBalance
        }
      },

    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithPhone = async (phone: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Supabase sign out error:", error);
    } finally {
      // Always clear user in local state so navigation and UI updates correctly
      setUser(null);
      setSession(null);
    }
  };

  const loginWithDemo = async () => {
    const demoUser: User = {
      id: "demo-user-id",
      aud: "authenticated",
      role: "authenticated",
      email: "demo@payaware.io",
      phone: "",
      confirmation_sent_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // We can't easily create a real Supabase Session object without extensive mocking,
    // but for our app's purposes, we mostly check `user`.
    // We will set the user state directly.
    setUser(demoUser);
    return { data: { user: demoUser }, error: null };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithPhone,
    loginWithDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};