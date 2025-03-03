export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      food_logs: {
        Row: {
          id: string
          user_id: string
          food_name: string
          serving_size: number
          serving_unit: string
          calories: number
          protein: number
          carbs: number
          fat: number
          meal_type: string
          image_url: string | null
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_name: string
          serving_size: number
          serving_unit: string
          calories: number
          protein: number
          carbs: number
          fat: number
          meal_type: string
          image_url?: string | null
          logged_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_name?: string
          serving_size?: number
          serving_unit?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          meal_type?: string
          image_url?: string | null
          logged_at?: string
          created_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_date: string
          icon: string | null
          color: string | null
          target_days: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_date: string
          icon?: string | null
          color?: string | null
          target_days?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_date?: string
          icon?: string | null
          color?: string | null
          target_days?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      meditations: {
        Row: {
          id: string
          title: string
          description: string | null
          duration: number
          image_url: string
          audio_url: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          duration: number
          image_url: string
          audio_url: string
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          duration?: number
          image_url?: string
          audio_url?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}