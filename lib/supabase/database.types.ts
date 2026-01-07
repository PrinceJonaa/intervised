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
      ai_usage: {
        Row: {
          cost_usd: number
          created_at: string | null
          id: string
          input_tokens: number
          model_name: string
          output_tokens: number
          session_id: string | null
          user_id: string
        }
        Insert: {
          cost_usd?: number
          created_at?: string | null
          id?: string
          input_tokens?: number
          model_name: string
          output_tokens?: number
          session_id?: string | null
          user_id: string
        }
        Update: {
          cost_usd?: number
          created_at?: string | null
          id?: string
          input_tokens?: number
          model_name?: string
          output_tokens?: number
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_comments: {
        Row: {
          author_avatar: string | null
          author_name: string
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          post_id: string
          user_id: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          post_id: string
          user_id?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string
          author_role: string | null
          category: Database["public"]["Enums"]["blog_category"] | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          likes: number | null
          meta_description: string | null
          meta_keywords: string[] | null
          published_at: string | null
          read_time: number | null
          slug: string
          status: Database["public"]["Enums"]["post_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id?: string | null
          author_name: string
          author_role?: string | null
          category?: Database["public"]["Enums"]["blog_category"] | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          likes?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string
          author_role?: string | null
          category?: Database["public"]["Enums"]["blog_category"] | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          likes?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          project_description: string | null
          provider: string
          scheduled_date: string | null
          scheduled_time: string | null
          selected_options: string[] | null
          service_id: string | null
          service_name: string
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          project_description?: string | null
          provider: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          selected_options?: string[] | null
          service_id?: string | null
          service_name: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          project_description?: string | null
          provider?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          selected_options?: string[] | null
          service_id?: string | null
          service_name?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          function_call: Json | null
          id: string
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
          tool_output: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          function_call?: Json | null
          id?: string
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
          tool_output?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          function_call?: Json | null
          id?: string
          role?: Database["public"]["Enums"]["message_role"]
          session_id?: string
          tool_output?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          analysis: Json | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis?: Json | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis?: Json | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          budget: Database["public"]["Enums"]["budget_tier"] | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          ip_address: unknown
          message: string
          name: string
          phone: string | null
          service_interest: string | null
          source: string | null
          status: Database["public"]["Enums"]["contact_status"] | null
          subject: string | null
          timeline: Database["public"]["Enums"]["timeline_type"] | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          budget?: Database["public"]["Enums"]["budget_tier"] | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
          message: string
          name: string
          phone?: string | null
          service_interest?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"] | null
          subject?: string | null
          timeline?: Database["public"]["Enums"]["timeline_type"] | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          budget?: Database["public"]["Enums"]["budget_tier"] | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          message?: string
          name?: string
          phone?: string | null
          service_interest?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"] | null
          subject?: string | null
          timeline?: Database["public"]["Enums"]["timeline_type"] | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          name: string | null
          source: string | null
          status: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          client: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          is_featured: boolean | null
          results: string | null
          sort_order: number | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          category: string
          client: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          results?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          category?: string
          client?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          results?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      service_options: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          price_modifier: number | null
          service_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_modifier?: number | null
          service_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_modifier?: number | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_options_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number
          category: string
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          is_active: boolean | null
          is_scalable: boolean | null
          name: string
          providers: string[] | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          category: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          is_scalable?: boolean | null
          name: string
          providers?: string[] | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          is_scalable?: boolean | null
          name?: string
          providers?: string[] | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          github: string | null
          id: string
          image: string | null
          is_active: boolean | null
          linkedin: string | null
          name: string
          role: string
          sort_order: number | null
          spotify: string | null
          status: Database["public"]["Enums"]["team_status"] | null
          twitter: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          github?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          linkedin?: string | null
          name: string
          role: string
          sort_order?: number | null
          spotify?: string | null
          status?: Database["public"]["Enums"]["team_status"] | null
          twitter?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          github?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          linkedin?: string | null
          name?: string
          role?: string
          sort_order?: number | null
          spotify?: string | null
          status?: Database["public"]["Enums"]["team_status"] | null
          twitter?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_company: string | null
          client_image: string | null
          client_name: string
          client_role: string | null
          created_at: string | null
          id: string
          is_featured: boolean | null
          project_type: string | null
          quote: string
          rating: number | null
          sort_order: number | null
        }
        Insert: {
          client_company?: string | null
          client_image?: string | null
          client_name: string
          client_role?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          project_type?: string | null
          quote: string
          rating?: number | null
          sort_order?: number | null
        }
        Update: {
          client_company?: string | null
          client_image?: string | null
          client_name?: string
          client_role?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          project_type?: string | null
          quote?: string
          rating?: number | null
          sort_order?: number | null
        }
        Relationships: []
      }
      user_ai_settings: {
        Row: {
          azure_deployment: string | null
          azure_endpoint: string | null
          created_at: string | null
          custom_api_key: string | null
          custom_model: string | null
          id: string
          provider: Database["public"]["Enums"]["ai_provider"] | null
          save_history: boolean | null
          style: string | null
          system_prompt: string | null
          temperature: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          azure_deployment?: string | null
          azure_endpoint?: string | null
          created_at?: string | null
          custom_api_key?: string | null
          custom_model?: string | null
          id?: string
          provider?: Database["public"]["Enums"]["ai_provider"] | null
          save_history?: boolean | null
          style?: string | null
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          azure_deployment?: string | null
          azure_endpoint?: string | null
          created_at?: string | null
          custom_api_key?: string | null
          custom_model?: string | null
          id?: string
          provider?: Database["public"]["Enums"]["ai_provider"] | null
          save_history?: boolean | null
          style?: string | null
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ai_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_tools: {
        Row: {
          created_at: string | null
          description: string
          function_body: string
          id: string
          is_active: boolean | null
          is_core: boolean | null
          name: string
          parameters: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          function_body: string
          id?: string
          is_active?: boolean | null
          is_core?: boolean | null
          name: string
          parameters: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          function_body?: string
          id?: string
          is_active?: boolean | null
          is_core?: boolean | null
          name?: string
          parameters?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_ai_spending: {
        Row: {
          last_request_at: string | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          total_requests: number | null
          total_spent_usd: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_ai_spending_limit: {
        Args: { p_limit_usd?: number; p_user_id: string }
        Returns: {
          current_spending: number
          is_under_limit: boolean
          remaining_budget: number
        }[]
      }
    }
    Enums: {
      ai_provider:
        | "google"
        | "openai"
        | "anthropic"
        | "cohere"
        | "azure"
        | "grok"
      blog_category: "Creative" | "Tech" | "Ministry" | "Strategy" | "Growth"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      budget_tier: "Seed" | "Growth" | "Scale" | "Enterprise"
      contact_status: "new" | "read" | "replied" | "archived"
      message_role: "user" | "model" | "system"
      post_status: "draft" | "published" | "archived"
      team_status: "Online" | "In Deep Work" | "Offline" | "On Set"
      timeline_type:
        | "Flexible"
        | "ASAP"
        | "1-2 Weeks"
        | "1 Month"
        | "2-3 Months"
        | "3+ Months"
      user_role: "admin" | "contributor" | "member"
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
      ai_provider: ["google", "openai", "anthropic", "cohere", "azure", "grok"],
      blog_category: ["Creative", "Tech", "Ministry", "Strategy", "Growth"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      budget_tier: ["Seed", "Growth", "Scale", "Enterprise"],
      contact_status: ["new", "read", "replied", "archived"],
      message_role: ["user", "model", "system"],
      post_status: ["draft", "published", "archived"],
      team_status: ["Online", "In Deep Work", "Offline", "On Set"],
      timeline_type: [
        "Flexible",
        "ASAP",
        "1-2 Weeks",
        "1 Month",
        "2-3 Months",
        "3+ Months",
      ],
      user_role: ["admin", "contributor", "member"],
    },
  },
} as const
