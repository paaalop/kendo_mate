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
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: { p_usename: string }
        Returns: {
          password: string
          username: string
        }[]
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
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_user_id_fkey"
            columns: ["user_id"]
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
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
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
          created_at: string | null
          guardian_id: string
          id: string
          profile_id: string
          relationship: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guardian_id: string
          id?: string
          profile_id: string
          relationship: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guardian_id?: string
          id?: string
          profile_id?: string
          relationship?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_requests_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
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
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
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
          view_count: number | null
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
          view_count?: number | null
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
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_dojo_id_fkey"
            columns: ["dojo_id"]
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_guardians: {
        Row: {
          created_at: string | null
          guardian_id: string
          id: string
          is_primary: boolean | null
          profile_id: string
          relationship: string
        }
        Insert: {
          created_at?: string | null
          guardian_id: string
          id?: string
          is_primary?: boolean | null
          profile_id: string
          relationship: string
        }
        Update: {
          created_at?: string | null
          guardian_id?: string
          id?: string
          is_primary?: boolean | null
          profile_id?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_guardians_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
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
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_history_promoted_by_fkey"
            columns: ["promoted_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_history_user_id_fkey"
            columns: ["user_id"]
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
            referencedRelation: "dojos"
            referencedColumns: ["id"]
          },
        ]
      }
      signup_requests: {
        Row: {
          birthdate: string | null
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
          birthdate?: string | null
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
          birthdate?: string | null
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
            referencedRelation: "curriculum_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
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
      bulk_upsert_profiles: {
        Args: { profiles_data: Json }
        Returns: undefined
      }
      cleanup_shadow_profiles: {
        Args: {
          target_birthdate?: string
          target_guardian_id: string
          target_name: string
        }
        Returns: undefined
      }
      find_potential_children: {
        Args: never
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
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
      get_members_v3: {
        Args: {
          p_dojo_id: string
          p_page?: number
          p_page_size?: number
          p_search?: string
        }
        Returns: {
          birthdate: string
          created_at: string
          default_session_time: string
          deleted_at: string
          dojo_id: string
          guardian_name: string
          guardian_phone: string
          id: string
          is_adult: boolean
          is_shadow: boolean
          name: string
          owner_id: string
          phone: string
          rank_level: number
          rank_name: string
          role: string
          total_count: number
          user_id: string
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
      increment_post_view_count: {
        Args: { post_id_param: string }
        Returns: undefined
      }
      is_dojo_admin_for_profile: {
        Args: { target_profile_id: string }
        Returns: boolean
      }
      is_dojo_member: { Args: { target_dojo_id: string }; Returns: boolean }
      is_dojo_owner: { Args: { target_dojo_id: string }; Returns: boolean }
      is_dojo_staff: { Args: { target_dojo_id: string }; Returns: boolean }
      link_child: {
        Args: { child_profile_id: string; relation: string }
        Returns: undefined
      }
      promote_member: {
        Args: { new_rank: string; target_member_id: string }
        Returns: undefined
      }
      reorder_curriculum_item: {
        Args: { new_index: number; target_item_id: string }
        Returns: undefined
      }
      search_profiles_by_phone:
        | {
            Args: { search_phone: string; target_dojo_id?: string }
            Returns: {
              birthdate: string
              dojo_id: string
              dojo_name: string
              guardian_phone: string
              id: string
              name: string
            }[]
          }
        | {
            Args: {
              requester_uuid?: string
              search_phone: string
              target_dojo_id?: string
            }
            Returns: {
              birthdate: string
              dojo_id: string
              dojo_name: string
              guardian_phone: string
              id: string
              name: string
            }[]
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  pgbouncer: {
    Enums: {},
  },
  public: {
    Enums: {
      post_category: ["FREE", "QUESTION", "EXERCISE"],
      report_status: ["PENDING", "RESOLVED"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
