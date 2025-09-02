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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          cost: number | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          profit: number | null
          revenue: number | null
          user_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          profit?: number | null
          revenue?: number | null
          user_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          profit?: number | null
          revenue?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_status: string | null
          consultation_id: string | null
          created_at: string | null
          currency: string | null
          drop_address: string | null
          id: string
          passport_country: string | null
          passport_expiry: string | null
          passport_number: string | null
          payment_method: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          pickup_address: string | null
          total_amount: number
          tour_package_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_status?: string | null
          consultation_id?: string | null
          created_at?: string | null
          currency?: string | null
          drop_address?: string | null
          id?: string
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          pickup_address?: string | null
          total_amount: number
          tour_package_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_status?: string | null
          consultation_id?: string | null
          created_at?: string | null
          currency?: string | null
          drop_address?: string | null
          id?: string
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          pickup_address?: string | null
          total_amount?: number
          tour_package_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tour_package_id_fkey"
            columns: ["tour_package_id"]
            isOneToOne: false
            referencedRelation: "tour_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          file_url: string | null
          id: string
          message_type: string
          read_at: string | null
          sender_id: string
          sender_type: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id: string
          sender_type: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_requests: {
        Row: {
          created_at: string | null
          doctor_id: string
          id: string
          message: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_requests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          allergies: string | null
          approved_at: string | null
          consultation_date: string | null
          created_at: string
          current_medications: string | null
          doctor_id: string
          doctor_notes: string | null
          id: string
          medical_condition: string | null
          medical_history: string | null
          notes: string | null
          passport_country: string | null
          passport_expiry: string | null
          passport_number: string | null
          preferred_travel_date: string | null
          previous_surgeries: string | null
          report_url: string | null
          reviewed_at: string | null
          status: string | null
          symptoms: string | null
          treatment_id: string | null
          updated_at: string
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          allergies?: string | null
          approved_at?: string | null
          consultation_date?: string | null
          created_at?: string
          current_medications?: string | null
          doctor_id: string
          doctor_notes?: string | null
          id?: string
          medical_condition?: string | null
          medical_history?: string | null
          notes?: string | null
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          preferred_travel_date?: string | null
          previous_surgeries?: string | null
          report_url?: string | null
          reviewed_at?: string | null
          status?: string | null
          symptoms?: string | null
          treatment_id?: string | null
          updated_at?: string
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          allergies?: string | null
          approved_at?: string | null
          consultation_date?: string | null
          created_at?: string
          current_medications?: string | null
          doctor_id?: string
          doctor_notes?: string | null
          id?: string
          medical_condition?: string | null
          medical_history?: string | null
          notes?: string | null
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          preferred_travel_date?: string | null
          previous_surgeries?: string | null
          report_url?: string | null
          reviewed_at?: string | null
          status?: string | null
          symptoms?: string | null
          treatment_id?: string | null
          updated_at?: string
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_portfolios: {
        Row: {
          after_image_url: string | null
          before_image_url: string | null
          case_type: string | null
          created_at: string
          description: string | null
          doctor_id: string
          id: string
          patient_testimonial: string | null
          success_rate: number | null
          title: string
          treatment_duration: string | null
          updated_at: string
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          case_type?: string | null
          created_at?: string
          description?: string | null
          doctor_id: string
          id?: string
          patient_testimonial?: string | null
          success_rate?: number | null
          title: string
          treatment_duration?: string | null
          updated_at?: string
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          case_type?: string | null
          created_at?: string
          description?: string | null
          doctor_id?: string
          id?: string
          patient_testimonial?: string | null
          success_rate?: number | null
          title?: string
          treatment_duration?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_portfolios_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          doctor_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          doctor_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_reviews_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio: string | null
          certifications: string[] | null
          consultation_fee: number | null
          created_at: string
          education: string | null
          hospital: string
          hospital_id: string | null
          id: string
          image_url: string | null
          languages: string[] | null
          name: string
          phone: string | null
          rating: number | null
          slots: Json | null
          specialization: string
          total_reviews: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          consultation_fee?: number | null
          created_at?: string
          education?: string | null
          hospital: string
          hospital_id?: string | null
          id?: string
          image_url?: string | null
          languages?: string[] | null
          name: string
          phone?: string | null
          rating?: number | null
          slots?: Json | null
          specialization: string
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          consultation_fee?: number | null
          created_at?: string
          education?: string | null
          hospital?: string
          hospital_id?: string | null
          id?: string
          image_url?: string | null
          languages?: string[] | null
          name?: string
          phone?: string | null
          rating?: number | null
          slots?: Json | null
          specialization?: string
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_credentials: {
        Row: {
          created_at: string | null
          email: string
          hospital_name: string
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          hospital_name: string
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          hospital_name?: string
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      hospital_reviews: {
        Row: {
          created_at: string
          helpful_count: number | null
          hospital_id: string
          id: string
          patient_id: string
          rating: number
          review_text: string | null
          treatment_type: string | null
          updated_at: string
          verified_stay: boolean | null
        }
        Insert: {
          created_at?: string
          helpful_count?: number | null
          hospital_id: string
          id?: string
          patient_id: string
          rating: number
          review_text?: string | null
          treatment_type?: string | null
          updated_at?: string
          verified_stay?: boolean | null
        }
        Update: {
          created_at?: string
          helpful_count?: number | null
          hospital_id?: string
          id?: string
          patient_id?: string
          rating?: number
          review_text?: string | null
          treatment_type?: string | null
          updated_at?: string
          verified_stay?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_reviews_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          featured: boolean | null
          hospital_id: string
          id: string
          image_url: string | null
          includes: string[] | null
          name: string
          price_range: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          hospital_id: string
          id?: string
          image_url?: string | null
          includes?: string[] | null
          name: string
          price_range?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          hospital_id?: string
          id?: string
          image_url?: string | null
          includes?: string[] | null
          name?: string
          price_range?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_services_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          accreditations: string[] | null
          address: string
          city: string
          country: string
          created_at: string
          description: string | null
          email: string | null
          emergency_available: boolean | null
          icu_beds: number | null
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          phone: string | null
          rating: number | null
          specializations: string[] | null
          state: string
          total_beds: number | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          accreditations?: string[] | null
          address: string
          city: string
          country?: string
          created_at?: string
          description?: string | null
          email?: string | null
          emergency_available?: boolean | null
          icu_beds?: number | null
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          rating?: number | null
          specializations?: string[] | null
          state: string
          total_beds?: number | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          accreditations?: string[] | null
          address?: string
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          email?: string | null
          emergency_available?: boolean | null
          icu_beds?: number | null
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          rating?: number | null
          specializations?: string[] | null
          state?: string
          total_beds?: number | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          consultation_id: string
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          record_type: string | null
          uploaded_by: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          record_type?: string | null
          uploaded_by: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          record_type?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          country_code: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stays: {
        Row: {
          amenities: string[] | null
          city: string
          created_at: string
          description: string | null
          hospital_proximity_km: number | null
          id: string
          image_url: string | null
          name: string
          price_per_night: number
          rating: number | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          city: string
          created_at?: string
          description?: string | null
          hospital_proximity_km?: number | null
          id?: string
          image_url?: string | null
          name: string
          price_per_night: number
          rating?: number | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          city?: string
          created_at?: string
          description?: string | null
          hospital_proximity_km?: number | null
          id?: string
          image_url?: string | null
          name?: string
          price_per_night?: number
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tour_packages: {
        Row: {
          category: string | null
          city: string
          created_at: string
          description: string | null
          duration: string | null
          highlights: string[] | null
          id: string
          image_url: string | null
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          city: string
          created_at?: string
          description?: string | null
          duration?: string | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          price: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          city?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          category: string | null
          city: string
          created_at: string
          description: string | null
          duration: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          price_inr: number
          price_usd: number
          savings_percent: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          city: string
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          price_inr: number
          price_usd: number
          savings_percent?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          city?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          price_inr?: number
          price_usd?: number
          savings_percent?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role: "patient" | "doctor" | "admin" | "hospital"
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
      user_role: ["patient", "doctor", "admin", "hospital"],
    },
  },
} as const
