import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail } from '@/utils/emailHelpers';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateMinisterStatus: (verified: boolean, certificateUrl?: string, ministerName?: string) => Promise<void>;
  getMinisterStatus: () => Promise<{ verified: boolean; name: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Use the current app URL, not localhost
      const currentUrl = window.location.href.includes('localhost') 
        ? 'https://d2754b1a-a880-48ec-9477-1d67b19e3aa5.lovableproject.com'
        : window.location.origin;
      const redirectUrl = `${currentUrl}/automation`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Send beautiful welcome email
        const emailResult = await sendWelcomeEmail(
          email, 
          fullName, 
          `${window.location.origin}/automation?welcome=true`
        );
        
        if (emailResult.success) {
          toast({
            title: "Welcome to TROOTHHURTZ! 🎉",
            description: "Please check your email to confirm your account and start your Boot Camp journey.",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
        }
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      // Even if there's an error, clear the local state
      setUser(null);
      setSession(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }
  };

  const updateMinisterStatus = async (verified: boolean, certificateUrl?: string, ministerName?: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        minister_verified: verified,
        minister_certificate_url: certificateUrl,
        minister_name: ministerName,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error updating minister status:', error);
      throw error;
    }

    toast({
      title: verified ? "Minister Status Activated" : "Minister Status Updated",
      description: verified ? "You are now recognized as an ordained minister!" : "Minister status has been updated.",
    });
  };

  const getMinisterStatus = async () => {
    if (!user) return { verified: false, name: null };
    
    const { data, error } = await supabase
      .from('profiles')
      .select('minister_verified, minister_name, first_name')
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      console.error('Error getting minister status:', error);
      return { verified: false, name: null };
    }
    
    return {
      verified: data.minister_verified || false,
      name: data.minister_name || data.first_name || null
    };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateMinisterStatus,
    getMinisterStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}