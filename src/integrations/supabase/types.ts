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
      area_revenue: {
        Row: {
          actual: number
          category: string
          id: string
          office: string
          stream: string
          target: number
          updated_at: string
          year: number
        }
        Insert: {
          actual?: number
          category: string
          id?: string
          office: string
          stream: string
          target?: number
          updated_at?: string
          year: number
        }
        Update: {
          actual?: number
          category?: string
          id?: string
          office?: string
          stream?: string
          target?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "area_revenue_year_fkey"
            columns: ["year"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["year"]
          },
        ]
      }
      challenges: {
        Row: {
          id: string
          sort_order: number
          text: string
          year: number
        }
        Insert: {
          id?: string
          sort_order?: number
          text: string
          year: number
        }
        Update: {
          id?: string
          sort_order?: number
          text?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_year_fkey"
            columns: ["year"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["year"]
          },
        ]
      }
      hr_metrics: {
        Row: {
          id: string
          item: string
          sort_order: number
          updated_at: string
          value: number
          year: number
        }
        Insert: {
          id?: string
          item: string
          sort_order?: number
          updated_at?: string
          value?: number
          year: number
        }
        Update: {
          id?: string
          item?: string
          sort_order?: number
          updated_at?: string
          value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hr_metrics_year_fkey"
            columns: ["year"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["year"]
          },
        ]
      }
      kra_rows: {
        Row: {
          actual: number
          comparison_type: string | null
          current_value: number | null
          id: string
          kpi: string
          kra: string
          pct: number
          previous_value: number | null
          sort_order: number
          subgroup: string | null
          target: number
          updated_at: string
          year: number
        }
        Insert: {
          actual?: number
          comparison_type?: string | null
          current_value?: number | null
          id?: string
          kpi: string
          kra: string
          pct?: number
          previous_value?: number | null
          sort_order?: number
          subgroup?: string | null
          target?: number
          updated_at?: string
          year: number
        }
        Update: {
          actual?: number
          comparison_type?: string | null
          current_value?: number | null
          id?: string
          kpi?: string
          kra?: string
          pct?: number
          previous_value?: number | null
          sort_order?: number
          subgroup?: string | null
          target?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "kra_rows_year_fkey"
            columns: ["year"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["year"]
          },
        ]
      }
      presenter_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          section: string
          sort_order: number
          title: string | null
          updated_at: string
          year: number
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          section: string
          sort_order?: number
          title?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          section?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      revenue_rows: {
        Row: {
          actual: number
          id: string
          line: string
          pct: number
          sort_order: number
          target: number
          updated_at: string
          year: number
        }
        Insert: {
          actual?: number
          id?: string
          line: string
          pct?: number
          sort_order?: number
          target?: number
          updated_at?: string
          year: number
        }
        Update: {
          actual?: number
          id?: string
          line?: string
          pct?: number
          sort_order?: number
          target?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "revenue_rows_year_fkey"
            columns: ["year"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["year"]
          },
        ]
      }
      staff_school: {
        Row: {
          exam: string
          id: string
          passed: number
          pct: number
          students: number
          updated_at: string
          year: number
        }
        Insert: {
          exam: string
          id?: string
          passed?: number
          pct?: number
          students?: number
          updated_at?: string
          year: number
        }
        Update: {
          exam?: string
          id?: string
          passed?: number
          pct?: number
          students?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_school_year_fkey"
            columns: ["year"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["year"]
          },
        ]
      }
      training_programmes: {
        Row: {
          id: string
          participants: number | null
          programme: string
          updated_at: string
          year: number
        }
        Insert: {
          id?: string
          participants?: number | null
          programme: string
          updated_at?: string
          year: number
        }
        Update: {
          id?: string
          participants?: number | null
          programme?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_programmes_year_fkey"
            columns: ["year"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["year"]
          },
        ]
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
      way_forward: {
        Row: {
          id: string
          sort_order: number
          text: string
          year: number
        }
        Insert: {
          id?: string
          sort_order?: number
          text: string
          year: number
        }
        Update: {
          id?: string
          sort_order?: number
          text?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "way_forward_year_fkey"
            columns: ["year"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["year"]
          },
        ]
      }
      wins: {
        Row: {
          created_at: string
          id: string
          section: string
          sort_order: number
          text: string
          tone: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          section?: string
          sort_order?: number
          text: string
          tone?: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          section?: string
          sort_order?: number
          text?: string
          tone?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      years: {
        Row: {
          created_at: string
          is_active: boolean
          label: string
          year: number
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          label: string
          year: number
        }
        Update: {
          created_at?: string
          is_active?: boolean
          label?: string
          year?: number
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
      app_role: "admin" | "viewer"
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
      app_role: ["admin", "viewer"],
    },
  },
} as const
