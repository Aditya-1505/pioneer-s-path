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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          title: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          id: string
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
        }
        Update: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          addons: string[] | null
          created_at: string
          departure_date: string | null
          email: string | null
          id: string
          is_read: boolean
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          read_at: string | null
          status: string
          total_amount: number | null
          tour_id: string | null
          tour_title: string | null
          travelers: number
          updated_at: string
        }
        Insert: {
          addons?: string[] | null
          created_at?: string
          departure_date?: string | null
          email?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          status?: string
          total_amount?: number | null
          tour_id?: string | null
          tour_title?: string | null
          travelers?: number
          updated_at?: string
        }
        Update: {
          addons?: string[] | null
          created_at?: string
          departure_date?: string | null
          email?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          status?: string
          total_amount?: number | null
          tour_id?: string | null
          tour_title?: string | null
          travelers?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_trip_requests: {
        Row: {
          budget: string | null
          created_at: string
          destination_preference: string | null
          email: string | null
          id: string
          is_read: boolean
          name: string
          notes: string | null
          phone: string | null
          read_at: string | null
          requirements: string | null
          status: string
          travel_dates: string | null
          travelers: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          destination_preference?: string | null
          email?: string | null
          id?: string
          is_read?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          requirements?: string | null
          status?: string
          travel_dates?: string | null
          travelers?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          destination_preference?: string | null
          email?: string | null
          id?: string
          is_read?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          requirements?: string | null
          status?: string
          travel_dates?: string | null
          travelers?: string | null
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer: string | null
          category: string | null
          created_at: string
          display_order: number
          id: string
          question: string
          tour_id: string | null
        }
        Insert: {
          answer?: string | null
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          question: string
          tour_id?: string | null
        }
        Update: {
          answer?: string | null
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          question?: string
          tour_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          destination: string | null
          id: string
          image_url: string | null
          title: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          image_url?: string | null
          title?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          image_url?: string | null
          title?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          destination: string | null
          email: string | null
          id: string
          is_read: boolean
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          read_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          status?: string
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          config: Json
          created_at: string
          id: string
          key: string
          label: string
          status: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          key: string
          label: string
          status?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          key?: string
          label?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      map_destinations: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_visible: boolean
          latitude: number
          longitude: number
          name: string
          region: string | null
          tour_id: string | null
          tour_slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_visible?: boolean
          latitude: number
          longitude: number
          name: string
          region?: string | null
          tour_id?: string | null
          tour_slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_visible?: boolean
          latitude?: number
          longitude?: number
          name?: string
          region?: string | null
          tour_id?: string | null
          tour_slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "map_destinations_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          name: string | null
          read_at: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          name?: string | null
          read_at?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          name?: string | null
          read_at?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          read_at: string | null
          related_record_id: string | null
          related_table: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          read_at?: string | null
          related_record_id?: string | null
          related_table?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          read_at?: string | null
          related_record_id?: string | null
          related_table?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      seasonal_collections: {
        Row: {
          banner_image: string | null
          created_at: string
          display_end: string | null
          display_order: number
          display_start: string | null
          id: string
          is_active: boolean
          season: string | null
          subtitle: string | null
          title: string
          tour_id: string | null
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          created_at?: string
          display_end?: string | null
          display_order?: number
          display_start?: string | null
          id?: string
          is_active?: boolean
          season?: string | null
          subtitle?: string | null
          title: string
          tour_id?: string | null
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          created_at?: string
          display_end?: string | null
          display_order?: number
          display_start?: string | null
          id?: string
          is_active?: boolean
          season?: string | null
          subtitle?: string | null
          title?: string
          tour_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_collections_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      surprise_trip_requests: {
        Row: {
          budget: string | null
          created_at: string
          destination: string | null
          email: string | null
          id: string
          is_read: boolean
          name: string
          notes: string | null
          occasion: string | null
          phone: string | null
          read_at: string | null
          requirements: string | null
          status: string
        }
        Insert: {
          budget?: string | null
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          is_read?: boolean
          name: string
          notes?: string | null
          occasion?: string | null
          phone?: string | null
          read_at?: string | null
          requirements?: string | null
          status?: string
        }
        Update: {
          budget?: string | null
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          is_read?: boolean
          name?: string
          notes?: string | null
          occasion?: string | null
          phone?: string | null
          read_at?: string | null
          requirements?: string | null
          status?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          role: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          role?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          role?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          customer_name: string
          id: string
          photo_url: string | null
          rating: number | null
          review: string | null
          trip_name: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          id?: string
          photo_url?: string | null
          rating?: number | null
          review?: string | null
          trip_name?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: string
          photo_url?: string | null
          rating?: number | null
          review?: string | null
          trip_name?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      tour_addons: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          price: number
          required: boolean
          tour_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          price?: number
          required?: boolean
          tour_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          price?: number
          required?: boolean
          tour_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_addons_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          accommodation: string | null
          best_season: string | null
          created_at: string
          departure_dates: string[] | null
          description: string | null
          destination: string | null
          difficulty: string | null
          duration: string | null
          exclusions: string[] | null
          featured: boolean | null
          gallery_images: string[] | null
          group_size: number | null
          group_type: string | null
          hero_image: string | null
          highlights: string[] | null
          id: string
          inclusions: string[] | null
          itinerary: Json | null
          network_info: string | null
          packing_guide: string[] | null
          price: number | null
          seats_available: number | null
          short_description: string | null
          slug: string
          status: string
          title: string
          transport: string | null
          updated_at: string
          vibe: string | null
          video_urls: string[] | null
          weather_info: string | null
        }
        Insert: {
          accommodation?: string | null
          best_season?: string | null
          created_at?: string
          departure_dates?: string[] | null
          description?: string | null
          destination?: string | null
          difficulty?: string | null
          duration?: string | null
          exclusions?: string[] | null
          featured?: boolean | null
          gallery_images?: string[] | null
          group_size?: number | null
          group_type?: string | null
          hero_image?: string | null
          highlights?: string[] | null
          id?: string
          inclusions?: string[] | null
          itinerary?: Json | null
          network_info?: string | null
          packing_guide?: string[] | null
          price?: number | null
          seats_available?: number | null
          short_description?: string | null
          slug: string
          status?: string
          title: string
          transport?: string | null
          updated_at?: string
          vibe?: string | null
          video_urls?: string[] | null
          weather_info?: string | null
        }
        Update: {
          accommodation?: string | null
          best_season?: string | null
          created_at?: string
          departure_dates?: string[] | null
          description?: string | null
          destination?: string | null
          difficulty?: string | null
          duration?: string | null
          exclusions?: string[] | null
          featured?: boolean | null
          gallery_images?: string[] | null
          group_size?: number | null
          group_type?: string | null
          hero_image?: string | null
          highlights?: string[] | null
          id?: string
          inclusions?: string[] | null
          itinerary?: Json | null
          network_info?: string | null
          packing_guide?: string[] | null
          price?: number | null
          seats_available?: number | null
          short_description?: string | null
          slug?: string
          status?: string
          title?: string
          transport?: string | null
          updated_at?: string
          vibe?: string | null
          video_urls?: string[] | null
          weather_info?: string | null
        }
        Relationships: []
      }
      trip_planner_requests: {
        Row: {
          budget: string | null
          created_at: string
          email: string | null
          group_type: string | null
          id: string
          is_read: boolean
          month: string | null
          name: string | null
          notes: string | null
          phone: string | null
          read_at: string | null
          recommendation: string | null
          status: string
          travelers: string | null
          trip_type: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          email?: string | null
          group_type?: string | null
          id?: string
          is_read?: boolean
          month?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          recommendation?: string | null
          status?: string
          travelers?: string | null
          trip_type?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          email?: string | null
          group_type?: string | null
          id?: string
          is_read?: boolean
          month?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          recommendation?: string | null
          status?: string
          travelers?: string | null
          trip_type?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager"
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
      app_role: ["super_admin", "admin", "manager"],
    },
  },
} as const
