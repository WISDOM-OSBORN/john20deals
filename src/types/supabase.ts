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
          image_url_2: string | null
          category: string
          stock: number
          condition: string | null
          swap_allowed: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          image_url_2?: string | null
          category: string
          stock?: number
          condition?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          image_url_2?: string | null
          category?: string
          stock?: number
          condition?: string | null
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
      
      swap_requests: {
        Row: {
          id: string
          created_at: string
          status: string
          user_id: string
          user_name: string | null
          user_phone: string | null
          product_id: string | null
          product_name: string | null
          offer_description: string | null
          image_url_1: string | null
          image_url_2: string | null
          image_url_3: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          status?: string
          user_id: string
          user_name?: string | null
          user_phone?: string | null
          product_id?: string | null
          product_name?: string | null
          offer_description?: string | null
          image_url_1?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          status?: string
          user_id?: string
          user_name?: string | null
          user_phone?: string | null
          product_id?: string | null
          product_name?: string | null
          offer_description?: string | null
          image_url_1?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swap_requests_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
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
