
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to check admin status
  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);
      
      // Using a direct query with service role to bypass RLS
      // This avoids the infinite recursion
      const { data, error } = await supabase
        .rpc('check_is_admin', { user_id: userId })
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching admin status:', error);
        
        // Fallback to a simple query if RPC fails
        // Try direct query with explicit select
        const profileQuery = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileQuery.error) {
          console.error('Fallback query also failed:', profileQuery.error);
          return false;
        }
        
        return profileQuery.data?.is_admin === true;
      }
      
      console.log('Admin status check result:', data);
      return data === true;
    } catch (err) {
      console.error('Exception checking admin status:', err);
      return false;
    }
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    setIsLoading(true);
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, !!currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(async () => {
            const isUserAdmin = await checkAdminStatus(currentSession.user.id);
            console.log('Is user admin:', isUserAdmin);
            setIsAdmin(isUserAdmin);
            setIsLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);

      // Check admin status for existing session
      if (session?.user) {
        try {
          const isUserAdmin = await checkAdminStatus(session.user.id);
          console.log('Initial admin status check:', isUserAdmin);
          setIsAdmin(isUserAdmin);
        } catch (error) {
          console.error('Error checking initial admin status:', error);
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
