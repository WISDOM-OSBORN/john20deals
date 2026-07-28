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
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string
          stock: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category: string
          stock?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string
          stock?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          products: Json
          total_price: number
          status: string
          delivery_method?: string | null
          shipping_address?: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          products: Json
          total_price: number
          status?: string
          delivery_method?: string | null
          shipping_address?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          products?: Json
          total_price?: number
          status?: string
          delivery_method?: string | null
          shipping_address?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          phone_number: string | null
          is_whatsapp: boolean | null
          location: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          phone_number?: string | null
          is_whatsapp?: boolean | null
          location?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          phone_number?: string | null
          is_whatsapp?: boolean | null
          location?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          user_id: string
          product_id: string
          rating: number
          comment: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          product_id: string
          rating: number
          comment: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          product_id?: string
          rating?: number
          comment?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      newsletter_subscribers: {
        Row: {
          id: string
          created_at: string
          email: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
