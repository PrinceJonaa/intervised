export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_resource: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_resource?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_resource?: string | null
        }
      }
      contact_messages: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          service_interest: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          service_interest?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          service_interest?: string | null
          status?: string | null
          subject?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
      }
      services: {
        Row: {
          base_price: number | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          price_display: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          price_display?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          price_display?: string | null
          title?: string
          updated_at?: string | null
        }
      }
      bookings: {
        Row: {
          customer_email: string
          customer_name: string
          id: string
          notes: string | null
          scheduled_date: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number | null
          user_id: string | null
          provider: string | null
          service_name: string | null
          created_at: string | null
        }
        Insert: {
          customer_email: string
          customer_name: string
          id?: string
          notes?: string | null
          scheduled_date?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number | null
          user_id?: string | null
          provider?: string | null
          service_name?: string | null
          created_at?: string | null
        }
        Update: {
          customer_email?: string
          customer_name?: string
          id?: string
          notes?: string | null
          scheduled_date?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number | null
          user_id?: string | null
          provider?: string | null
          service_name?: string | null
          created_at?: string | null
        }
      }
      projects: {
        Row: {
          category: string | null
          client: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          client?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          client?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
      }
      blog_posts: {
        Row: {
          author_id: string
          category: Database["public"]["Enums"]["blog_category"]
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id: string
          category: Database["public"]["Enums"]["blog_category"]
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string
          category?: Database["public"]["Enums"]["blog_category"]
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
        }
      }
      transparency_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_type: string
          notes: string | null
          period: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_type: string
          notes?: string | null
          period: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_type?: string
          notes?: string | null
          period?: string
          value?: number
        }
      }
      ai_usage: {
        Row: {
          id: string
          created_at: string
          user_id: string
          model_name: string
          input_tokens: number
          output_tokens: number
          cost_usd: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string
          model_name: string
          input_tokens: number
          output_tokens: number
          cost_usd: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          model_name?: string
          input_tokens?: number
          output_tokens?: number
          cost_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "contributor" | "member"
      booking_status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
      blog_category: "Creative" | "Tech" | "Ministry" | "Strategy" | "Growth"
      post_status: "draft" | "published" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
