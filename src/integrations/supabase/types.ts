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
      articles: {
        Row: {
          author: string
          body: string
          category: Database["public"]["Enums"]["article_category"]
          cover: string
          created_at: string
          id: string
          is_published: boolean | null
          lead: string
          published_at: string
          read_time: number
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          body: string
          category: Database["public"]["Enums"]["article_category"]
          cover?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          lead: string
          published_at?: string
          read_time?: number
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          body?: string
          category?: Database["public"]["Enums"]["article_category"]
          cover?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          lead?: string
          published_at?: string
          read_time?: number
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          area_m2: number | null
          building_type: string | null
          created_at: string
          email: string | null
          file_upload: string | null
          id: string
          meeting_preference: string | null
          message: string | null
          name: string
          phone: string
          region: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
        }
        Insert: {
          area_m2?: number | null
          building_type?: string | null
          created_at?: string
          email?: string | null
          file_upload?: string | null
          id?: string
          meeting_preference?: string | null
          message?: string | null
          name: string
          phone: string
          region?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Update: {
          area_m2?: number | null
          building_type?: string | null
          created_at?: string
          email?: string | null
          file_upload?: string | null
          id?: string
          meeting_preference?: string | null
          message?: string | null
          name?: string
          phone?: string
          region?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Relationships: []
      }
      products: {
        Row: {
          applications: string[] | null
          created_at: string
          excerpt: string
          faq: Json | null
          gallery: string[] | null
          icon: string
          id: string
          is_published: boolean | null
          price_from: number
          price_to: number
          related_projects: string[] | null
          slug: string
          specs_fire_resistance: string | null
          specs_heights: string | null
          specs_insulation: string | null
          specs_snow_load: string | null
          specs_spans: string | null
          steps: Json | null
          title: string
          updated_at: string
          usp: string[] | null
        }
        Insert: {
          applications?: string[] | null
          created_at?: string
          excerpt: string
          faq?: Json | null
          gallery?: string[] | null
          icon: string
          id?: string
          is_published?: boolean | null
          price_from: number
          price_to: number
          related_projects?: string[] | null
          slug: string
          specs_fire_resistance?: string | null
          specs_heights?: string | null
          specs_insulation?: string | null
          specs_snow_load?: string | null
          specs_spans?: string | null
          steps?: Json | null
          title: string
          updated_at?: string
          usp?: string[] | null
        }
        Update: {
          applications?: string[] | null
          created_at?: string
          excerpt?: string
          faq?: Json | null
          gallery?: string[] | null
          icon?: string
          id?: string
          is_published?: boolean | null
          price_from?: number
          price_to?: number
          related_projects?: string[] | null
          slug?: string
          specs_fire_resistance?: string | null
          specs_heights?: string | null
          specs_insulation?: string | null
          specs_snow_load?: string | null
          specs_spans?: string | null
          steps?: Json | null
          title?: string
          updated_at?: string
          usp?: string[] | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          area: number
          budget_max: number
          budget_min: number
          created_at: string
          height: number
          id: string
          is_published: boolean | null
          photos: string[] | null
          problem: string
          product_type: string
          region: string
          result: string
          segment: Database["public"]["Enums"]["project_segment"]
          slug: string
          solution: string
          span: number
          tags: string[] | null
          term_weeks: number
          testimonial_author: string | null
          testimonial_position: string | null
          testimonial_text: string | null
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          area: number
          budget_max: number
          budget_min: number
          created_at?: string
          height: number
          id?: string
          is_published?: boolean | null
          photos?: string[] | null
          problem: string
          product_type: string
          region: string
          result: string
          segment: Database["public"]["Enums"]["project_segment"]
          slug: string
          solution: string
          span: number
          tags?: string[] | null
          term_weeks: number
          testimonial_author?: string | null
          testimonial_position?: string | null
          testimonial_text?: string | null
          title: string
          updated_at?: string
          year: number
        }
        Update: {
          area?: number
          budget_max?: number
          budget_min?: number
          created_at?: string
          height?: number
          id?: string
          is_published?: boolean | null
          photos?: string[] | null
          problem?: string
          product_type?: string
          region?: string
          result?: string
          segment?: Database["public"]["Enums"]["project_segment"]
          slug?: string
          solution?: string
          span?: number
          tags?: string[] | null
          term_weeks?: number
          testimonial_author?: string | null
          testimonial_position?: string | null
          testimonial_text?: string | null
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          confirmed: boolean | null
          created_at: string
          email: string
          id: string
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string
          email?: string
          id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      article_category: "новости" | "технологии" | "закупки"
      lead_status: "new" | "in_progress" | "closed"
      project_segment:
        | "промышленность"
        | "логистика"
        | "агро"
        | "B2G"
        | "торговля"
        | "авто"
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
      app_role: ["admin", "editor", "user"],
      article_category: ["новости", "технологии", "закупки"],
      lead_status: ["new", "in_progress", "closed"],
      project_segment: [
        "промышленность",
        "логистика",
        "агро",
        "B2G",
        "торговля",
        "авто",
      ],
    },
  },
} as const
