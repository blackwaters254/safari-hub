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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          admin_notes: string | null
          cover_letter: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          opportunity_id: string
          phone: string | null
          portfolio_url: string | null
          resume_url: string | null
          social_instagram: string | null
          social_other: string | null
          social_tiktok: string | null
          social_twitter: string | null
          social_youtube: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          cover_letter?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          opportunity_id: string
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          social_instagram?: string | null
          social_other?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          cover_letter?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          opportunity_id?: string
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          social_instagram?: string | null
          social_other?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_paid: number
          booking_date: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          guests: number
          id: string
          item_id: string
          item_title: string
          item_type: Database["public"]["Enums"]["item_type"]
          notes: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"]
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          travel_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          booking_date?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          guests?: number
          id?: string
          item_id: string
          item_title: string
          item_type: Database["public"]["Enums"]["item_type"]
          notes?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"]
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          travel_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          booking_date?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          guests?: number
          id?: string
          item_id?: string
          item_title?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          notes?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"]
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          travel_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          price: number
          short_description: string | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          price?: number
          short_description?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          price?: number
          short_description?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          price: number
          short_description: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          price?: number
          short_description?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          price?: number
          short_description?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hotel_contacts: {
        Row: {
          category: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          category?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          category?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          created_at: string
          deadline: string | null
          description: string
          id: string
          is_active: boolean
          is_paid: boolean
          location: string | null
          requirements: string | null
          salary_range: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          bank_account_name: string
          bank_account_number: string
          bank_branch: string
          bank_name: string
          bank_swift: string
          created_at: string
          currency_rate_eur: number
          currency_rate_usd: number
          hot_deal_active: boolean
          hot_deal_end_date: string
          hot_deal_includes: string[] | null
          hot_deal_savings_label: string | null
          hot_deal_subtitle: string | null
          hot_deal_tier1_label: string | null
          hot_deal_tier1_now_ksh: number | null
          hot_deal_tier1_was_ksh: number | null
          hot_deal_tier2_label: string | null
          hot_deal_tier2_now_ksh: number | null
          hot_deal_tier2_was_ksh: number | null
          hot_deal_tier3_label: string | null
          hot_deal_tier3_now_ksh: number | null
          hot_deal_tier3_was_ksh: number | null
          hot_deal_title: string | null
          id: string
          paybill_account: string
          paybill_number: string
          till_number: string
          updated_at: string
        }
        Insert: {
          bank_account_name?: string
          bank_account_number?: string
          bank_branch?: string
          bank_name?: string
          bank_swift?: string
          created_at?: string
          currency_rate_eur?: number
          currency_rate_usd?: number
          hot_deal_active?: boolean
          hot_deal_end_date?: string
          hot_deal_includes?: string[] | null
          hot_deal_savings_label?: string | null
          hot_deal_subtitle?: string | null
          hot_deal_tier1_label?: string | null
          hot_deal_tier1_now_ksh?: number | null
          hot_deal_tier1_was_ksh?: number | null
          hot_deal_tier2_label?: string | null
          hot_deal_tier2_now_ksh?: number | null
          hot_deal_tier2_was_ksh?: number | null
          hot_deal_tier3_label?: string | null
          hot_deal_tier3_now_ksh?: number | null
          hot_deal_tier3_was_ksh?: number | null
          hot_deal_title?: string | null
          id?: string
          paybill_account?: string
          paybill_number?: string
          till_number?: string
          updated_at?: string
        }
        Update: {
          bank_account_name?: string
          bank_account_number?: string
          bank_branch?: string
          bank_name?: string
          bank_swift?: string
          created_at?: string
          currency_rate_eur?: number
          currency_rate_usd?: number
          hot_deal_active?: boolean
          hot_deal_end_date?: string
          hot_deal_includes?: string[] | null
          hot_deal_savings_label?: string | null
          hot_deal_subtitle?: string | null
          hot_deal_tier1_label?: string | null
          hot_deal_tier1_now_ksh?: number | null
          hot_deal_tier1_was_ksh?: number | null
          hot_deal_tier2_label?: string | null
          hot_deal_tier2_now_ksh?: number | null
          hot_deal_tier2_was_ksh?: number | null
          hot_deal_tier3_label?: string | null
          hot_deal_tier3_now_ksh?: number | null
          hot_deal_tier3_was_ksh?: number | null
          hot_deal_title?: string | null
          id?: string
          paybill_account?: string
          paybill_number?: string
          till_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          due_date: string | null
          id: string
          installment_number: number | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"]
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          installment_number?: number | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"]
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          installment_number?: number | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"]
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          is_active: boolean
          notes: string | null
          phone: string | null
          role: string
          updated_at: string
          vehicle_plate: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          vehicle_plate?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          code_expires_at: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          message: string
          priority: string
          status: string
          subject: string
          ticket_code: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          code_expires_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          ticket_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          code_expires_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          ticket_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string
          sender_type?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: string
          excluded: Json | null
          highlights: Json | null
          id: string
          image_url: string | null
          included: Json | null
          is_active: boolean
          itinerary: Json | null
          price_ksh: number
          price_label: string
          short_description: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string
          excluded?: Json | null
          highlights?: Json | null
          id?: string
          image_url?: string | null
          included?: Json | null
          is_active?: boolean
          itinerary?: Json | null
          price_ksh?: number
          price_label?: string
          short_description?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string
          excluded?: Json | null
          highlights?: Json | null
          id?: string
          image_url?: string | null
          included?: Json | null
          is_active?: boolean
          itinerary?: Json | null
          price_ksh?: number
          price_label?: string
          short_description?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_messages_by_ticket_code: {
        Args: { _code: string }
        Returns: {
          created_at: string
          id: string
          message: string
          sender_type: string
          ticket_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "ticket_messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_ticket_by_code: {
        Args: { _code: string }
        Returns: {
          admin_notes: string | null
          code_expires_at: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          message: string
          priority: string
          status: string
          subject: string
          ticket_code: string | null
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "support_tickets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      send_message_by_ticket_code: {
        Args: { _code: string; _message: string; _sender_type?: string }
        Returns: {
          created_at: string
          id: string
          message: string
          sender_type: string
          ticket_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ticket_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      item_type: "tour" | "event" | "experience"
      payment_plan: "full" | "deposit" | "installment"
      payment_status: "pending" | "processing" | "succeeded" | "failed"
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
      app_role: ["admin", "customer"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      item_type: ["tour", "event", "experience"],
      payment_plan: ["full", "deposit", "installment"],
      payment_status: ["pending", "processing", "succeeded", "failed"],
    },
  },
} as const
