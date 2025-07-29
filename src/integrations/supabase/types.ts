export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          contract_text: string
          created_at: string
          customer_signature: string | null
          customer_signed_at: string | null
          id: string
          pdf_url: string | null
          quote_id: string
          status: string | null
          supplier_signature: string | null
          supplier_signed_at: string | null
          updated_at: string
        }
        Insert: {
          contract_text: string
          created_at?: string
          customer_signature?: string | null
          customer_signed_at?: string | null
          id?: string
          pdf_url?: string | null
          quote_id: string
          status?: string | null
          supplier_signature?: string | null
          supplier_signed_at?: string | null
          updated_at?: string
        }
        Update: {
          contract_text?: string
          created_at?: string
          customer_signature?: string | null
          customer_signed_at?: string | null
          id?: string
          pdf_url?: string | null
          quote_id?: string
          status?: string | null
          supplier_signature?: string | null
          supplier_signed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string | null
          deposit_type: string
          id: string
          lawyer_id: string
          lead_id: string
          paid_at: string | null
          payment_method: string | null
          quote_id: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          deposit_type: string
          id?: string
          lawyer_id: string
          lead_id: string
          paid_at?: string | null
          payment_method?: string | null
          quote_id?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          deposit_type?: string
          id?: string
          lawyer_id?: string
          lead_id?: string
          paid_at?: string | null
          payment_method?: string | null
          quote_id?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposits_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string
          release_conditions: string | null
          released_to_supplier_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id: string
          release_conditions?: string | null
          released_to_supplier_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          release_conditions?: string | null
          released_to_supplier_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_scores: {
        Row: {
          acceptance_rate: number | null
          created_at: string
          id: string
          lawyer_id: string
          monthly_score: number | null
          nps_average: number | null
          pro_bono_hours: number | null
          refund_ratio: number | null
          sla_hit_rate: number | null
          updated_at: string
        }
        Insert: {
          acceptance_rate?: number | null
          created_at?: string
          id?: string
          lawyer_id: string
          monthly_score?: number | null
          nps_average?: number | null
          pro_bono_hours?: number | null
          refund_ratio?: number | null
          sla_hit_rate?: number | null
          updated_at?: string
        }
        Update: {
          acceptance_rate?: number | null
          created_at?: string
          id?: string
          lawyer_id?: string
          monthly_score?: number | null
          nps_average?: number | null
          pro_bono_hours?: number | null
          refund_ratio?: number | null
          sla_hit_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_scores_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_tiers: {
        Row: {
          created_at: string
          early_access_hours: number | null
          financial_bonus_multiplier: number | null
          id: string
          lawyer_id: string
          platform_fee_reduction: number | null
          tier: string
          tier_score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          early_access_hours?: number | null
          financial_bonus_multiplier?: number | null
          id?: string
          lawyer_id: string
          platform_fee_reduction?: number | null
          tier?: string
          tier_score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          early_access_hours?: number | null
          financial_bonus_multiplier?: number | null
          id?: string
          lawyer_id?: string
          platform_fee_reduction?: number | null
          tier?: string
          tier_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_tiers_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyers: {
        Row: {
          availability_status: string | null
          bio: string | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          law_firm: string | null
          license_number: string | null
          location: string | null
          profile_id: string
          rating: number | null
          specializations: string[]
          total_cases: number | null
          updated_at: string | null
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          availability_status?: string | null
          bio?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          law_firm?: string | null
          license_number?: string | null
          location?: string | null
          profile_id: string
          rating?: number | null
          specializations?: string[]
          total_cases?: number | null
          updated_at?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          availability_status?: string | null
          bio?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          law_firm?: string | null
          license_number?: string | null
          location?: string | null
          profile_id?: string
          rating?: number | null
          specializations?: string[]
          total_cases?: number | null
          updated_at?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lawyers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_access: {
        Row: {
          access_level: string
          created_at: string | null
          deposit_id: string
          expires_at: string | null
          id: string
          lawyer_id: string
          lead_id: string
        }
        Insert: {
          access_level: string
          created_at?: string | null
          deposit_id: string
          expires_at?: string | null
          id?: string
          lawyer_id: string
          lead_id: string
        }
        Update: {
          access_level?: string
          created_at?: string | null
          deposit_id?: string
          expires_at?: string | null
          id?: string
          lawyer_id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_access_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_access_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_access_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignments: {
        Row: {
          assigned_at: string | null
          assignment_type: string
          id: string
          lawyer_id: string
          lead_id: string
          notes: string | null
          responded_at: string | null
          response_deadline: string | null
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          assignment_type: string
          id?: string
          lawyer_id: string
          lead_id: string
          notes?: string | null
          responded_at?: string | null
          response_deadline?: string | null
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          assignment_type?: string
          id?: string
          lawyer_id?: string
          lead_id?: string
          notes?: string | null
          responded_at?: string | null
          response_deadline?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_categories: {
        Row: {
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_lawyer_id: string | null
          case_description: string
          case_details: Json | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          estimated_budget: number | null
          id: string
          legal_category: string
          preferred_location: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          urgency_level: string | null
          visibility_level: string | null
        }
        Insert: {
          assigned_lawyer_id?: string | null
          case_description: string
          case_details?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          estimated_budget?: number | null
          id?: string
          legal_category: string
          preferred_location?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          visibility_level?: string | null
        }
        Update: {
          assigned_lawyer_id?: string | null
          case_description?: string
          case_details?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          estimated_budget?: number | null
          id?: string
          legal_category?: string
          preferred_location?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          visibility_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_lawyer_id_fkey"
            columns: ["assigned_lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          escrow_released_at: string | null
          id: string
          paid_at: string | null
          payment_type: string
          status: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          escrow_released_at?: string | null
          id?: string
          paid_at?: string | null
          payment_type: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          escrow_released_at?: string | null
          id?: string
          paid_at?: string | null
          payment_type?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string | null
          estimated_duration_days: number | null
          id: string
          lawyer_id: string
          lead_id: string
          payment_terms: string | null
          quote_amount: number
          service_description: string
          status: string | null
          terms_and_conditions: string | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_duration_days?: number | null
          id?: string
          lawyer_id: string
          lead_id: string
          payment_terms?: string | null
          quote_amount: number
          service_description: string
          status?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_duration_days?: number | null
          id?: string
          lawyer_id?: string
          lead_id?: string
          payment_terms?: string | null
          quote_amount?: number
          service_description?: string
          status?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          availability_hours: Json | null
          business_category: string
          created_at: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          profile_id: string
          rating: number | null
          service_description: string | null
          specialties: string[] | null
          total_jobs: number | null
          updated_at: string
        }
        Insert: {
          availability_hours?: Json | null
          business_category: string
          created_at?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          profile_id: string
          rating?: number | null
          service_description?: string | null
          specialties?: string[] | null
          total_jobs?: number | null
          updated_at?: string
        }
        Update: {
          availability_hours?: Json | null
          business_category?: string
          created_at?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          profile_id?: string
          rating?: number | null
          service_description?: string | null
          specialties?: string[] | null
          total_jobs?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_monthly_score: {
        Args: {
          p_lawyer_id: string
          p_leads_accepted?: number
          p_sla_met?: boolean
          p_nps_score?: number
          p_pro_bono_hours?: number
          p_refunds?: number
          p_sla_critical_miss?: boolean
        }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
