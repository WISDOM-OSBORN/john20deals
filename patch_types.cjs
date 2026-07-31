const fs = require('fs');
let types = fs.readFileSync('src/types/supabase.ts', 'utf8');

const swapRequestsType = `
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
      }`;

types = types.replace('newsletter_subscribers: {', swapRequestsType + '\n      newsletter_subscribers: {');
fs.writeFileSync('src/types/supabase.ts', types);
console.log('patched');
