import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let authTimeout;

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError.message);
        }

        if (session && isMounted) {
          setSession(session);
          setUser(session.user);
          await fetchUserRole(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    // Safety fallback: if Supabase takes more than 5 seconds, stop loading
    authTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth loading timed out. Forcing UI render.');
        setLoading(false);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // We don't await this so it doesn't block the UI rendering if it's slow
        fetchUserRole(session.user.id).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) throw error;

      if (data && data.role === 'blocked') {
        alert("Kechirasiz, sizga tizimdan foydalanish ruxsati berilmagan!");
        await supabase.auth.signOut();
        setRole(null);
        setUser(null);
        setSession(null);
      } else if (data) {
        setRole(data.role);
      } else {
        setRole('seller'); 
      }
    } catch (err) {
      console.error('Error fetching role:', err);
      // Agar role topilmasa (masalan, hali profile yaratib ulgurmagan bo'lsa), default qiymat qaytaramiz
      // Lekin 'blocked' ehtimolini saqlab qolish uchun ehtiyotkor bo'lamiz
      setRole('seller');
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, signInWithGoogle, signOut }}>
      {loading ? (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-indigo-400 font-medium animate-pulse">Avtorizatsiya tekshirilmoqda...</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
