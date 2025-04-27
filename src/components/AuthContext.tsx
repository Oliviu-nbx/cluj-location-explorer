
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

  // Check admin status using our non-recursive RPC function
  const checkAdminStatus = async () => {
    try {
      // Use the admin_check RPC function we created in the database
      const { data, error } = await supabase
        .rpc('admin_check')
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data === true;
    } catch (err) {
      console.error('Exception in admin check:', err);
      return false;
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Initializing authentication');
    setIsLoading(true);
    
    // First, set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession ? 'session exists' : 'no session');
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Safely check admin status after the state is updated
          // Use setTimeout to avoid potential recursion issues
          setTimeout(async () => {
            const adminStatus = await checkAdminStatus();
            console.log('Admin status check result:', adminStatus);
            setIsAdmin(adminStatus);
            setIsLoading(false);
          }, 100);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log('Initial session check:', initialSession ? 'session exists' : 'no session');
      
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        const adminStatus = await checkAdminStatus();
        console.log('Initial admin status:', adminStatus);
        setIsAdmin(adminStatus);
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up listener');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('Signing out');
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
