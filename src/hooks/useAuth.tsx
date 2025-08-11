import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthResult {
  error: { message: string } | null
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name: string; phone?: string; role?: string }) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create profile for new users - prevents loops
        if (event === 'SIGNED_IN' && session?.user && !user) {
          setTimeout(() => {
            if (isMounted) {
              createUserProfile(session.user);
            }
          }, 100);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // run only once at initialization

  const createUserProfile = async (user: User) => {
    try {
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        toast({ title: 'Profile already exists for user' });
        return;
      }

      // Create new profile only if it doesn't exist
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          role: user.user_metadata?.role || 'customer'
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        toast({
          title: 'Error creating profile',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error creating profile',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      });
    }
  };

  const signUp = async (email: string, password: string, metadata?: { full_name: string; phone?: string; role?: string }) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: metadata?.full_name || '',
            phone: metadata?.phone || '',
            role: metadata?.role || 'customer'
          }
        }
      });

      if (error) {
        let errorMessage = "An error occurred during registration. Please try again.";

        if (error.message === 'User already registered') {
          errorMessage = "User is already registered";
        } else if (error.message.includes('Password')) {
          errorMessage = "Password must be at least 6 characters";
        } else if (error.message.includes('Email')) {
          errorMessage = "Invalid email address";
        }

        return { error: { message: errorMessage } };
      }

      // User registered successfully
      if (data.user) {
        toast({
          title: "Registration successful!",
          description: data.user.email_confirmed_at
            ? "Welcome to the system"
            : "Check your email to verify your account",
        });
      }

      return { error: null };
    } catch (err) {
      toast({
        title: 'Signup error',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
      return { error: { message: "An unexpected error occurred. Please try again." } };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign-in error",
        description: error.message === 'Invalid login credentials'
          ? "Incorrect login details"
          : "An error occurred during sign-in. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed in successfully",
        description: "Welcome to the system",
      });
    }

    return { error: error ? { message: error.message } : null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast({
        title: "Signed out successfully",
        description: "Goodbye!",
      });
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error: error ? { message: error.message } : null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? { message: error.message } : null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};