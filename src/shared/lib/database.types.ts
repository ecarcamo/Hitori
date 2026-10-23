export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          aliases: string[]
          archived_at: string | null
          color_slot: number
          created_at: string
          id: string
          important_by_default: boolean
          max_in_progress: number | null
          name: string
          sort_order: string
          updated_at: string
          urgency_days: number | null
          user_id: string
        }
        ComputedFields: never
        Insert: {
          aliases?: string[]
          archived_at?: string | null
          color_slot?: number
          created_at?: string
          id?: string
          important_by_default?: boolean
          max_in_progress?: number | null
          name: string
          sort_order: string
          updated_at?: string
          urgency_days?: number | null
          user_id?: string
        }
        Update: {
          aliases?: string[]
          archived_at?: string | null
          color_slot?: number
          created_at?: string
          id?: string
          important_by_default?: boolean
          max_in_progress?: number | null
          name?: string
          sort_order?: string
          updated_at?: string
          urgency_days?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      checklist_items: {
        Row: {
          created_at: string
          id: string
          is_done: boolean
          label: string
          sort_order: string
          task_id: string
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          is_done?: boolean
          label: string
          sort_order: string
          task_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_done?: boolean
          label?: string
          sort_order?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'checklist_items_task_id_user_id_fkey'
            columns: ['task_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      profiles: {
        Row: {
          color_mode: Database['public']['Enums']['color_mode']
          created_at: string
          custom_theme: Json | null
          daily_digest_time: string | null
          display_name: string | null
          id: string
          locale: string
          max_in_progress: number
          theme: string
          timezone: string
          updated_at: string
          urgency_days: number
        }
        ComputedFields: never
        Insert: {
          color_mode?: Database['public']['Enums']['color_mode']
          created_at?: string
          custom_theme?: Json | null
          daily_digest_time?: string | null
          display_name?: string | null
          id: string
          locale?: string
          max_in_progress?: number
          theme?: string
          timezone?: string
          updated_at?: string
          urgency_days?: number
        }
        Update: {
          color_mode?: Database['public']['Enums']['color_mode']
          created_at?: string
          custom_theme?: Json | null
          daily_digest_time?: string | null
          display_name?: string | null
          id?: string
          locale?: string
          max_in_progress?: number
          theme?: string
          timezone?: string
          updated_at?: string
          urgency_days?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        ComputedFields: never
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'push_subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      recurrence_rules: {
        Row: {
          created_at: string
          creates_blocks: boolean
          id: string
          next_occurrence: string | null
          rrule: string
          task_id: string
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          creates_blocks?: boolean
          id?: string
          next_occurrence?: string | null
          rrule: string
          task_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          creates_blocks?: boolean
          id?: string
          next_occurrence?: string | null
          rrule?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recurrence_rules_task_id_user_id_fkey'
            columns: ['task_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      subcategories: {
        Row: {
          aliases: string[]
          archived_at: string | null
          category_id: string
          created_at: string
          id: string
          name: string
          sort_order: string
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          aliases?: string[]
          archived_at?: string | null
          category_id: string
          created_at?: string
          id?: string
          name: string
          sort_order: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          aliases?: string[]
          archived_at?: string | null
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subcategories_category_id_user_id_fkey'
            columns: ['category_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      tasks: {
        Row: {
          archived_at: string | null
          blocked_by: string | null
          category_id: string | null
          completed_at: string | null
          context: Database['public']['Enums']['task_context'] | null
          created_at: string
          due_at: string | null
          duration_min: number | null
          energy: Database['public']['Enums']['energy_level'] | null
          id: string
          is_important: boolean
          notes: string | null
          planned_end: string | null
          planned_start: string | null
          sort_order: string
          status: Database['public']['Enums']['task_status']
          subcategory_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          blocked_by?: string | null
          category_id?: string | null
          completed_at?: string | null
          context?: Database['public']['Enums']['task_context'] | null
          created_at?: string
          due_at?: string | null
          duration_min?: number | null
          energy?: Database['public']['Enums']['energy_level'] | null
          id?: string
          is_important?: boolean
          notes?: string | null
          planned_end?: string | null
          planned_start?: string | null
          sort_order: string
          status?: Database['public']['Enums']['task_status']
          subcategory_id?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          blocked_by?: string | null
          category_id?: string | null
          completed_at?: string | null
          context?: Database['public']['Enums']['task_context'] | null
          created_at?: string
          due_at?: string | null
          duration_min?: number | null
          energy?: Database['public']['Enums']['energy_level'] | null
          id?: string
          is_important?: boolean
          notes?: string | null
          planned_end?: string | null
          planned_start?: string | null
          sort_order?: string
          status?: Database['public']['Enums']['task_status']
          subcategory_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_category_id_user_id_fkey'
            columns: ['category_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'tasks_subcategory_id_category_id_fkey'
            columns: ['subcategory_id', 'category_id']
            isOneToOne: false
            referencedRelation: 'subcategories'
            referencedColumns: ['id', 'category_id']
          },
          {
            foreignKeyName: 'tasks_subcategory_id_user_id_fkey'
            columns: ['subcategory_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'subcategories'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'tasks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
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
      color_mode: 'light' | 'dark' | 'system'
      energy_level: 'low' | 'high'
      task_context: 'home' | 'computer' | 'campus' | 'office' | 'errands'
      task_status: 'todo' | 'in_progress' | 'waiting' | 'done'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      color_mode: ['light', 'dark', 'system'],
      energy_level: ['low', 'high'],
      task_context: ['home', 'computer', 'campus', 'office', 'errands'],
      task_status: ['todo', 'in_progress', 'waiting', 'done'],
    },
  },
} as const
