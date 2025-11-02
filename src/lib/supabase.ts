import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category: string
  images: string[]
  seller_id: string
  contact_number: string
  additional_details?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  role: 'buyer' | 'seller' | 'both'
  created_at?: string
  updated_at?: string
}