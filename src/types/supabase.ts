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
          swap_allowed?: boolean | null
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
          swap_allowed?: boolean | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          products: any
          total_price: number
          status: string
          delivery_method?: string | null
          shipping_address?: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          products: any
          total_price: number
          status?: string
          delivery_method?: string | null
          shipping_address?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          products?: any
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
          trade_in_value: number | null
          cash_difference: number | null
          terms: string | null
          notified_at: string | null
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
          trade_in_value?: number | null
          cash_difference?: number | null
          terms?: string | null
          notified_at?: string | null
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
          trade_in_value?: number | null
          cash_difference?: number | null
          terms?: string | null
          notified_at?: string | null
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

      sell_requests: {
        Row: {
          id: string
          created_at: string
          status: string
          user_id: string
          user_name: string | null
          user_phone: string | null
          device_type: string | null
          brand: string | null
          model: string | null
          condition: string | null
          description: string | null
          offer_price: number | null
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
          device_type?: string | null
          brand?: string | null
          model?: string | null
          condition?: string | null
          description?: string | null
          offer_price?: number | null
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
          device_type?: string | null
          brand?: string | null
          model?: string | null
          condition?: string | null
          description?: string | null
          offer_price?: number | null
          image_url_1?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
        }
        Relationships: []
      }

      repair_requests: {
        Row: {
          id: string
          created_at: string
          status: string
          user_id: string
          user_name: string | null
          user_phone: string | null
          device_type: string | null
          issue_description: string | null
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
          device_type?: string | null
          issue_description?: string | null
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
          device_type?: string | null
          issue_description?: string | null
          image_url_1?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
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
