import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types (auto-generated from Supabase)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'judge' | 'lawyer' | 'plaintiff';
          avatar_url?: string;
          organization?: string;
          phone?: string;
          address?: any;
          preferences?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'judge' | 'lawyer' | 'plaintiff';
          avatar_url?: string;
          organization?: string;
          phone?: string;
          address?: any;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'judge' | 'lawyer' | 'plaintiff';
          avatar_url?: string;
          organization?: string;
          phone?: string;
          address?: any;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      legal_cases: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          case_type: string;
          jurisdiction: string;
          status: 'active' | 'closed' | 'pending';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          tags: string[];
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          case_type?: string;
          jurisdiction?: string;
          status?: 'active' | 'closed' | 'pending';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          tags?: string[];
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          case_type?: string;
          jurisdiction?: string;
          status?: 'active' | 'closed' | 'pending';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          tags?: string[];
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_analyses: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          analysis_type: string;
          legal_system: string;
          ai_model: string;
          input_data: any;
          analysis_result: any;
          confidence_score?: number;
          processing_time_ms?: number;
          tokens_used?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          user_id: string;
          analysis_type?: string;
          legal_system: string;
          ai_model: string;
          input_data: any;
          analysis_result: any;
          confidence_score?: number;
          processing_time_ms?: number;
          tokens_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          user_id?: string;
          analysis_type?: string;
          legal_system?: string;
          ai_model?: string;
          input_data?: any;
          analysis_result?: any;
          confidence_score?: number;
          processing_time_ms?: number;
          tokens_used?: number;
          created_at?: string;
        };
      };
    };
  };
}

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
  if (error) throw error;
  return data;
};