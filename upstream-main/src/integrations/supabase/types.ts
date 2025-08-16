export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_extraction_logs: {
        Row: {
          case_draft_id: string | null
          confidence_score: number | null
          created_at: string | null
          extracted_fields: Json | null
          id: string
          input_text: string
          model_used: string | null
          processing_time_ms: number | null
          user_id: string
        }
        Insert: {
          case_draft_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          extracted_fields?: Json | null
          id?: string
          input_text: string
          model_used?: string | null
          processing_time_ms?: number | null
          user_id: string
        }
        Update: {
          case_draft_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          extracted_fields?: Json | null
          id?: string
          input_text?: string
          model_used?: string | null
          processing_time_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_extraction_logs_case_draft_id_fkey"
            columns: ["case_draft_id"]
            isOneToOne: false
            referencedRelation: "case_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      case_drafts: {
        Row: {
          claim_amount: number | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          evidence: Json | null
          extracted_fields: Json | null
          id: string
          is_simulation: boolean | null
          jurisdiction: string | null
          legal_category: string | null
          location: string | null
          parties: Json | null
          readiness_score: number | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          version_hash: string | null
        }
        Insert: {
          claim_amount?: number | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          evidence?: Json | null
          extracted_fields?: Json | null
          id?: string
          is_simulation?: boolean | null
          jurisdiction?: string | null
          legal_category?: string | null
          location?: string | null
          parties?: Json | null
          readiness_score?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          version_hash?: string | null
        }
        Update: {
          claim_amount?: number | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          evidence?: Json | null
          extracted_fields?: Json | null
          id?: string
          is_simulation?: boolean | null
          jurisdiction?: string | null
          legal_category?: string | null
          location?: string | null
          parties?: Json | null
          readiness_score?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          version_hash?: string | null
        }
        Relationships: []
      }
      cases: {
        Row: {
          assigned_lawyer_id: string | null
          client_id: string | null
          created_at: string | null
          estimated_budget: number | null
          id: string
          case_number: string | null
          invite_token: string | null
          legal_category: string
          notes: string | null
          opened_at: string | null
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_lawyer_id?: string | null
          client_id?: string | null
          created_at?: string | null
          estimated_budget?: number | null
          id?: string
          case_number?: string | null
          invite_token?: string | null
          legal_category: string
          notes?: string | null
          opened_at?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_lawyer_id?: string | null
          client_id?: string | null
          created_at?: string | null
          estimated_budget?: number | null
          id?: string
          case_number?: string | null
          invite_token?: string | null
          legal_category?: string
          notes?: string | null
          opened_at?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_lawyer_id_fkey"
            columns: ["assigned_lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          commission_rate: number
          contract_id: string
          created_at: string
          id: string
          paid_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          commission_rate: number
          contract_id: string
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          commission_rate?: number
          contract_id?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
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
      digital_contracts: {
        Row: {
          client_signature: string | null
          client_signed_at: string | null
          contract_content: string
          created_at: string
          id: string
          lawyer_signature: string | null
          lawyer_signed_at: string | null
          quote_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          client_signature?: string | null
          client_signed_at?: string | null
          contract_content: string
          created_at?: string
          id?: string
          lawyer_signature?: string | null
          lawyer_signed_at?: string | null
          quote_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_signature?: string | null
          client_signed_at?: string | null
          contract_content?: string
          created_at?: string
          id?: string
          lawyer_signature?: string | null
          lawyer_signed_at?: string | null
          quote_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
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
      events: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          lawyer_id: string | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          lawyer_id?: string | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          lawyer_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incoming_messages: {
        Row: {
          content: string
          created_at: string
          from_number: string
          id: string
          lead_id: string | null
          processed: boolean
          received_at: string
        }
        Insert: {
          content: string
          created_at?: string
          from_number: string
          id?: string
          lead_id?: string | null
          processed?: boolean
          received_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          from_number?: string
          id?: string
          lead_id?: string | null
          processed?: boolean
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incoming_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
      lawyer_specializations: {
        Row: {
          created_at: string
          experience_years: number | null
          id: string
          lawyer_id: string
          specialization: string
          success_rate: number | null
        }
        Insert: {
          created_at?: string
          experience_years?: number | null
          id?: string
          lawyer_id: string
          specialization: string
          success_rate?: number | null
        }
        Update: {
          created_at?: string
          experience_years?: number | null
          id?: string
          lawyer_id?: string
          specialization?: string
          success_rate?: number | null
        }
        Relationships: []
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
      meetings: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string
          id: string
          lawyer_id: string
          lead_id: string | null
          location: string | null
          meeting_type: string
          notes: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          lawyer_id: string
          lead_id?: string | null
          location?: string | null
          meeting_type?: string
          notes?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          lawyer_id?: string
          lead_id?: string | null
          location?: string | null
          meeting_type?: string
          notes?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          digest_frequency: string
          email: boolean
          id: string
          in_app: boolean
          profile_id: string
          updated_at: string
          whatsapp: boolean
        }
        Insert: {
          created_at?: string
          digest_frequency?: string
          email?: boolean
          id?: string
          in_app?: boolean
          profile_id: string
          updated_at?: string
          whatsapp?: boolean
        }
        Update: {
          created_at?: string
          digest_frequency?: string
          email?: boolean
          id?: string
          in_app?: boolean
          profile_id?: string
          updated_at?: string
          whatsapp?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      party_approvals: {
        Row: {
          approval_status: string | null
          approval_token: string | null
          approved_at: string | null
          case_draft_id: string
          created_at: string | null
          id: string
          party_email: string
          party_name: string
          party_role: string
        }
        Insert: {
          approval_status?: string | null
          approval_token?: string | null
          approved_at?: string | null
          case_draft_id: string
          created_at?: string | null
          id?: string
          party_email: string
          party_name: string
          party_role: string
        }
        Update: {
          approval_status?: string | null
          approval_token?: string | null
          approved_at?: string | null
          case_draft_id?: string
          created_at?: string | null
          id?: string
          party_email?: string
          party_name?: string
          party_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_approvals_case_draft_id_fkey"
            columns: ["case_draft_id"]
            isOneToOne: false
            referencedRelation: "case_drafts"
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
      ratings: {
        Row: {
          case_id: string
          client_id: string | null
          comment: string | null
          created_at: string
          id: string
          lawyer_id: string
          score: number
        }
        Insert: {
          case_id: string
          client_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          lawyer_id: string
          score: number
        }
        Update: {
          case_id?: string
          client_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          lawyer_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_transcriptions: {
        Row: {
          audio_duration_seconds: number | null
          case_draft_id: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          language_detected: string | null
          transcription_text: string
          user_id: string
        }
        Insert: {
          audio_duration_seconds?: number | null
          case_draft_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          language_detected?: string | null
          transcription_text: string
          user_id: string
        }
        Update: {
          audio_duration_seconds?: number | null
          case_draft_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          language_detected?: string | null
          transcription_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_transcriptions_case_draft_id_fkey"
            columns: ["case_draft_id"]
            isOneToOne: false
            referencedRelation: "case_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_matching_score: {
        Args: {
          p_estimated_budget?: number
          p_lawyer_id: string
          p_legal_category: string
        }
        Returns: number
      }
      calculate_monthly_score: {
        Args: {
          p_lawyer_id: string
          p_leads_accepted?: number
          p_nps_score?: number
          p_pro_bono_hours?: number
          p_refunds?: number
          p_sla_critical_miss?: boolean
          p_sla_met?: boolean
        }
        Returns: number
      }
      generate_case_version_hash: {
        Args: { draft_data: Json }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_matched_lawyers: {
        Args: { p_lead_id: string; p_limit?: number }
        Returns: {
          hourly_rate: number
          lawyer_id: string
          lawyer_name: string
          matching_score: number
          rating: number
          specializations: string[]
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      process_incoming_lead: {
        Args: { p_content: string; p_from_number: string }
        Returns: string
      }
    }
    Enums: {
      app_permission:
        | "leads.read"
        | "leads.create"
        | "leads.assign"
        | "cases.read"
        | "cases.create"
        | "cases.update"
        | "payments.manage"
        | "users.manage"
      app_role:
        | "admin"
        | "lawyer"
        | "client"
        | "supplier"
        | "customer"
        | "judge"
        | "witness"
        | "audience"
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
    Enums: {
      app_permission: [
        "leads.read",
        "leads.create",
        "leads.assign",
        "cases.read",
        "cases.create",
        "cases.update",
        "payments.manage",
        "users.manage",
      ],
      app_role: [
        "admin",
        "lawyer",
        "client",
        "supplier",
        "customer",
        "judge",
        "witness",
        "audience",
      ],
    },
  },
} as const
