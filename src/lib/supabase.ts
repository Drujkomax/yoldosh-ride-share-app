
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface User {
  id: string
  phone: string
  name?: string
  role: 'driver' | 'passenger'
  is_verified: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Ride {
  id: string
  driver_id: string
  from_city: string
  to_city: string
  departure_date: string
  departure_time: string
  available_seats: number
  price_per_seat: number
  car_info?: string
  description?: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  driver?: User
}

export interface RideRequest {
  id: string
  passenger_id: string
  from_city: string
  to_city: string
  preferred_date: string
  preferred_time?: string
  passengers_count: number
  max_price?: number
  comment?: string
  status: 'active' | 'matched' | 'cancelled'
  created_at: string
  passenger?: User
}

export interface Booking {
  id: string
  ride_id: string
  passenger_id: string
  seats_booked: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  ride?: Ride
  passenger?: User
}

export interface Chat {
  id: string
  participants: string[]
  last_message?: string
  last_message_at?: string
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: User
}
