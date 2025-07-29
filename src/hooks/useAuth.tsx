import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create profile for new users
        if (event === 'SIGNED_IN' && session?.user && !user) {
          setTimeout(() => {
            createUserProfile(session.user);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        console.log('Profile already exists for user');
        return;
      }

      // Create new profile only if it doesn't exist
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          role: 'customer'
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || ''
          }
        }
      });

      if (error) {
        let errorMessage = "אירעה שגיאה ברישום. אנא נסה שוב.";
        
        if (error.message === 'User already registered') {
          errorMessage = "המשתמש כבר רשום במערכת";
        } else if (error.message.includes('Password')) {
          errorMessage = "הסיסמה חייבת להכיל לפחות 6 תווים";
        } else if (error.message.includes('Email')) {
          errorMessage = "כתובת האימייל לא תקינה";
        }
        
        return { error: { message: errorMessage } };
      }

      // User registered successfully
      if (data.user) {
        toast({
          title: "נרשמת בהצלחה!",
          description: data.user.email_confirmed_at 
            ? "ברוך הבא למערכת" 
            : "בדוק את האימייל שלך לאימות החשבון",
        });
      }

      return { error: null };
    } catch (err) {
      console.error('Signup error:', err);
      return { error: { message: "אירעה שגיאה לא צפויה. אנא נסה שוב." } };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "שגיאה בהתחברות",
        description: error.message === 'Invalid login credentials' 
          ? "פרטי התחברות שגויים" 
          : "אירעה שגיאה בהתחברות. אנא נסה שוב.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "התחברות מוצלחת",
        description: "ברוך הבא למערכת",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut
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