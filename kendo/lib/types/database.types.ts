export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance_logs: {
        Row: {
          attended_at: string | null
          check_type: string | null
          created_at: string | null
          dojo_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          attended_at?: string | null
          check_type?: string | null
          created_at?: string | null
          dojo_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          attended_at?: string | null
          check_type?: string | null
          created_at?: string | null
          dojo_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_dojo_id_fkey"
            columns: ["dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          dojo_id: string | null
          id: string
          order_index: number
          required_rank_level: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          dojo_id?: string | null
          id?: string
          order_index: number
          required_rank_level?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          dojo_id?: string | null
          id?: string
          order_index?: number
          required_rank_level?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_items_dojo_id_fkey"
            columns: ["dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
        ]
      }
      dojos: {
        Row: {
          created_at: string | null
          default_fee: number | null
          id: string
          name: string
          owner_id: string
          trial_ends_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_fee?: number | null
          id?: string
          name: string
          owner_id: string
          trial_ends_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_fee?: number | null
          id?: string
          name?: string
          owner_id?: string
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      link_requests: {
        Row: {
          child_birthdate: string
          child_name: string
          created_at: string | null
          guardian_id: string
          id: string
          request_type: string
          status: string
          target_dojo_id: string
          updated_at: string | null
        }
        Insert: {
          child_birthdate: string
          child_name: string
          created_at?: string | null
          guardian_id: string
          id?: string
          request_type?: string
          status?: string
          target_dojo_id: string
          updated_at?: string | null
        }
        Update: {
          child_birthdate?: string
          child_name?: string
          created_at?: string | null
          guardian_id?: string
          id?: string
          request_type?: string
          status?: string
          target_dojo_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_requests_target_dojo_id_fkey"
            columns: ["target_dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          dojo_id: string
          id: string
          is_pinned: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          dojo_id: string
          id?: string
          is_pinned?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          dojo_id?: string
          id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_dojo_id_fkey"
            columns: ["dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string | null
          dojo_id: string | null
          id: string
          paid_at: string | null
          status: string | null
          target_month: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          dojo_id?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          target_month: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          dojo_id?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          target_month?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_dojo_id_fkey"
            columns: ["dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category: Database["public"]["Enums"]["post_category"]
          content: string
          created_at: string
          dojo_id: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: Database["public"]["Enums"]["post_category"]
          content: string
          created_at?: string
          dojo_id: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: Database["public"]["Enums"]["post_category"]
          content?: string
          created_at?: string
          dojo_id?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_dojo_id_fkey"
            columns: ["dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birthdate: string | null
          created_at: string | null
          default_session_time: string | null
          deleted_at: string | null
          dojo_id: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          is_adult: boolean | null
          is_shadow: boolean | null
          name: string
          owner_id: string | null
          phone: string | null
          rank_level: number | null
          rank_name: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          birthdate?: string | null
          created_at?: string | null
          default_session_time?: string | null
          deleted_at?: string | null
          dojo_id?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_adult?: boolean | null
          is_shadow?: boolean | null
          name: string
          owner_id?: string | null
          phone?: string | null
          rank_level?: number | null
          rank_name?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          birthdate?: string | null
          created_at?: string | null
          default_session_time?: string | null
          deleted_at?: string | null
          dojo_id?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_adult?: boolean | null
          is_shadow?: boolean | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          rank_level?: number | null
          rank_name?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_dojo_id_fkey"
            columns: ["dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
        ]
      }
      rank_history: {
        Row: {
          dojo_id: string
          id: string
          new_rank: string
          previous_rank: string | null
          promoted_at: string | null
          promoted_by: string | null
          user_id: string
        }
        Insert: {
          dojo_id: string
          id?: string
          new_rank: string
          previous_rank?: string | null
          promoted_at?: string | null
          promoted_by?: string | null
          user_id: string
        }
        Update: {
          dojo_id?: string
          id?: string
          new_rank?: string
          previous_rank?: string | null
          promoted_at?: string | null
          promoted_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_history_dojo_id_fkey"
            columns: ["dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_history_promoted_by_fkey"
            columns: ["promoted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          dojo_id: string
          end_time: string
          id: string
          name: string
          start_time: string
        }
        Insert: {
          created_at?: string
          dojo_id: string
          end_time: string
          id?: string
          name: string
          start_time: string
        }
        Update: {
          created_at?: string
          dojo_id?: string
          end_time?: string
          id?: string
          name?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_dojo_id_fkey"
            columns: ["dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
        ]
      }
      signup_requests: {
        Row: {
          created_at: string | null
          dojo_id: string | null
          guardian_phone: string | null
          id: string
          is_adult: boolean | null
          name: string
          phone: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dojo_id?: string | null
          guardian_phone?: string | null
          id?: string
          is_adult?: boolean | null
          name: string
          phone?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dojo_id?: string | null
          guardian_phone?: string | null
          id?: string
          is_adult?: boolean | null
          name?: string
          phone?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signup_requests_dojo_id_fkey"
            columns: ["dojo_id"]
            isOneToOne: false
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_at: string | null
          id: string
          item_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          item_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          item_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "curriculum_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
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
      approve_link_request_promote: {
        Args: { request_id: string }
        Returns: Json
      }
      generate_monthly_payments: {
        Args: { target_date: string }
        Returns: undefined
      }
      get_guardian_summary: {
        Args: { guardian_uuid: string }
        Returns: {
          dojo_name: string
          last_attendance_date: string
          link_request_type: string
          link_status: string
          member_id: string
          name: string
          unpaid_amount: number
          unpaid_count: number
        }[]
      }
      get_next_curriculum: {
        Args: { member_uuid: string }
        Returns: {
          category: string
          id: string
          order_index: number
          required_rank_level: number
          title: string
        }[]
      }
      is_dojo_member: { Args: { target_dojo_id: string }; Returns: boolean }
      is_dojo_owner: { Args: { target_dojo_id: string }; Returns: boolean }
      is_dojo_staff: { Args: { target_dojo_id: string }; Returns: boolean }
      promote_member: {
        Args: { new_rank: string; target_member_id: string }
        Returns: undefined
      }
      reorder_curriculum_item: {
        Args: { new_index: number; target_item_id: string }
        Returns: undefined
      }
      update_member_role: {
        Args: { new_role: string; target_member_id: string }
        Returns: undefined
      }
    }
    Enums: {
      post_category: "FREE" | "QUESTION" | "EXERCISE"
      report_status: "PENDING" | "RESOLVED"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      post_category: ["FREE", "QUESTION", "EXERCISE"],
      report_status: ["PENDING", "RESOLVED"],
    },
  },
} as const
