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
      blockchain_verifications: {
        Row: {
          blockchain_network: string | null
          created_at: string | null
          document_id: string | null
          id: string
          metadata: Json | null
          transaction_hash: string
          user_id: string | null
          verification_url: string | null
        }
        Insert: {
          blockchain_network?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          transaction_hash: string
          user_id?: string | null
          verification_url?: string | null
        }
        Update: {
          blockchain_network?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          transaction_hash?: string
          user_id?: string | null
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_verifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_files"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          overview_description: string | null
          overview_subtitle: string | null
          overview_title: string | null
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          overview_description?: string | null
          overview_subtitle?: string | null
          overview_title?: string | null
          price: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          overview_description?: string | null
          overview_subtitle?: string | null
          overview_title?: string | null
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_files: {
        Row: {
          course_id: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          metadata: Json | null
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          metadata?: Json | null
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          metadata?: Json | null
          upload_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_files_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          document_type: string
          id: string
          is_active: boolean
          name: string
          template_content: Json
          updated_at: string
          variables: Json | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          document_type: string
          id?: string
          is_active?: boolean
          name: string
          template_content?: Json
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          document_type?: string
          id?: string
          is_active?: boolean
          name?: string
          template_content?: Json
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      gift_codes: {
        Row: {
          code: string
          course_id: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          updated_at: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          course_id: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          course_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_codes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          component: string
          course_id: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number
          required: boolean | null
          updated_at: string
        }
        Insert: {
          component: string
          course_id: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index: number
          required?: boolean | null
          updated_at?: string
        }
        Update: {
          component?: string
          course_id?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number
          required?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          course_id: string
          created_at: string
          currency: string | null
          id: string
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          course_id: string
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          course_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          barcode_certificate_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          full_name: string | null
          google_drive_url: string | null
          id: string
          last_name: string | null
          minister_certificate_url: string | null
          minister_name: string | null
          minister_verified: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          barcode_certificate_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          full_name?: string | null
          google_drive_url?: string | null
          id?: string
          last_name?: string | null
          minister_certificate_url?: string | null
          minister_name?: string | null
          minister_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          barcode_certificate_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          full_name?: string | null
          google_drive_url?: string | null
          id?: string
          last_name?: string | null
          minister_certificate_url?: string | null
          minister_name?: string | null
          minister_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_steps: number[] | null
          course_id: string
          created_at: string
          current_step: number
          id: string
          is_complete: boolean | null
          step_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_steps?: number[] | null
          course_id: string
          created_at?: string
          current_step?: number
          id?: string
          is_complete?: boolean | null
          step_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_steps?: number[] | null
          course_id?: string
          created_at?: string
          current_step?: number
          id?: string
          is_complete?: boolean | null
          step_data?: Json | null
          updated_at?: string
          user_id?: string
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
      verification_logs: {
        Row: {
          action: string
          admin_id: string | null
          admin_notes: string | null
          created_at: string | null
          id: string
          user_id: string
          verified_status: boolean | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          user_id: string
          verified_status?: boolean | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
          verified_status?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_minister_status: {
        Args: { user_uuid: string }
        Returns: {
          is_minister: boolean
          minister_name: string
          verification_status: string
          certificate_url: string
        }[]
      }
      get_minister_verification_queue: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile_id: string
          full_name: string
          minister_name: string
          certificate_url: string
          submitted_at: string
          verification_status: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: { _user_id: string }
        Returns: boolean
      }
      update_minister_verification: {
        Args: { user_uuid: string; verified: boolean; admin_notes?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
