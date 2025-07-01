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
      bookings: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          passenger_id: string
          pickup_location: string | null
          ride_id: string
          seats_booked: number
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          passenger_id: string
          pickup_location?: string | null
          ride_id: string
          seats_booked: number
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          passenger_id?: string
          pickup_location?: string | null
          ride_id?: string
          seats_booked?: number
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_passenger"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_passenger"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_ride"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      car_photos: {
        Row: {
          car_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          photo_url: string
          updated_at: string | null
        }
        Insert: {
          car_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          photo_url: string
          updated_at?: string | null
        }
        Update: {
          car_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          photo_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_photos_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "user_cars"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant1_id: string
          participant2_id: string
          ride_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant1_id: string
          participant2_id: string
          ride_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant1_id?: string
          participant2_id?: string
          ride_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_participant1_id_fkey"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_participant1_id_fkey"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_participant2_id_fkey"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_participant2_id_fkey"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chats_participant1"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chats_participant1"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chats_participant2"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chats_participant2"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chats_ride"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string | null
          id: string
          location_data: Json | null
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string | null
          id?: string
          location_data?: Json | null
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string | null
          id?: string
          location_data?: Json | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_chat"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_stops: {
        Row: {
          address: string
          category: string
          city_name: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          popularity_score: number
          stop_name: string
          updated_at: string
        }
        Insert: {
          address: string
          category?: string
          city_name: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          popularity_score?: number
          stop_name: string
          updated_at?: string
        }
        Update: {
          address?: string
          category?: string
          city_name?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          popularity_score?: number
          stop_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string
          is_verified: boolean | null
          last_name: string | null
          marketing_consent: boolean | null
          name: string
          notification_settings: Json | null
          onboarding_completed: boolean | null
          phone: string
          privacy_consent: boolean | null
          privacy_settings: Json | null
          rating: number | null
          registration_method: string | null
          terms_accepted_at: string | null
          total_rides: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          marketing_consent?: boolean | null
          name: string
          notification_settings?: Json | null
          onboarding_completed?: boolean | null
          phone: string
          privacy_consent?: boolean | null
          privacy_settings?: Json | null
          rating?: number | null
          registration_method?: string | null
          terms_accepted_at?: string | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          marketing_consent?: boolean | null
          name?: string
          notification_settings?: Json | null
          onboarding_completed?: boolean | null
          phone?: string
          privacy_consent?: boolean | null
          privacy_settings?: Json | null
          rating?: number | null
          registration_method?: string | null
          terms_accepted_at?: string | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          review_type: string
          reviewed_user_id: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          review_type: string
          reviewed_user_id: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          review_type?: string
          reviewed_user_id?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_user_id_fkey"
            columns: ["reviewed_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_user_id_fkey"
            columns: ["reviewed_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          created_at: string | null
          description: string | null
          dropoff_address: string | null
          dropoff_latitude: number | null
          dropoff_longitude: number | null
          from_city: string
          id: string
          max_price_per_seat: number | null
          passenger_id: string
          passengers_count: number | null
          pickup_address: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          preferred_date: string
          status: string | null
          to_city: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          from_city: string
          id?: string
          max_price_per_seat?: number | null
          passenger_id: string
          passengers_count?: number | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          preferred_date: string
          status?: string | null
          to_city: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          from_city?: string
          id?: string
          max_price_per_seat?: number | null
          passenger_id?: string
          passengers_count?: number | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          preferred_date?: string
          status?: string | null
          to_city?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          available_seats: number
          car_color: string | null
          car_id: string | null
          car_model: string | null
          comfort_settings: Json | null
          created_at: string | null
          departure_date: string
          departure_flexibility: number | null
          departure_time: string
          description: string | null
          driver_id: string
          dropoff_address: string | null
          dropoff_latitude: number | null
          dropoff_longitude: number | null
          duration_hours: number | null
          estimated_arrival_time: string | null
          estimated_distance_km: number | null
          estimated_duration_minutes: number | null
          from_city: string
          id: string
          intermediate_stops: Json | null
          intermediate_stops_addresses: Json | null
          intermediate_stops_coordinates: Json | null
          passenger_dropoff_instructions: string | null
          passenger_pickup_instructions: string | null
          pickup_address: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          precise_dropoff_latitude: number | null
          precise_dropoff_longitude: number | null
          precise_pickup_latitude: number | null
          precise_pickup_longitude: number | null
          price_per_seat: number
          route_data: Json | null
          route_polyline: string | null
          status: string | null
          to_city: string
          toll_info: Json | null
          updated_at: string | null
        }
        Insert: {
          available_seats: number
          car_color?: string | null
          car_id?: string | null
          car_model?: string | null
          comfort_settings?: Json | null
          created_at?: string | null
          departure_date: string
          departure_flexibility?: number | null
          departure_time: string
          description?: string | null
          driver_id: string
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          duration_hours?: number | null
          estimated_arrival_time?: string | null
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          from_city: string
          id?: string
          intermediate_stops?: Json | null
          intermediate_stops_addresses?: Json | null
          intermediate_stops_coordinates?: Json | null
          passenger_dropoff_instructions?: string | null
          passenger_pickup_instructions?: string | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          precise_dropoff_latitude?: number | null
          precise_dropoff_longitude?: number | null
          precise_pickup_latitude?: number | null
          precise_pickup_longitude?: number | null
          price_per_seat: number
          route_data?: Json | null
          route_polyline?: string | null
          status?: string | null
          to_city: string
          toll_info?: Json | null
          updated_at?: string | null
        }
        Update: {
          available_seats?: number
          car_color?: string | null
          car_id?: string | null
          car_model?: string | null
          comfort_settings?: Json | null
          created_at?: string | null
          departure_date?: string
          departure_flexibility?: number | null
          departure_time?: string
          description?: string | null
          driver_id?: string
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          duration_hours?: number | null
          estimated_arrival_time?: string | null
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          from_city?: string
          id?: string
          intermediate_stops?: Json | null
          intermediate_stops_addresses?: Json | null
          intermediate_stops_coordinates?: Json | null
          passenger_dropoff_instructions?: string | null
          passenger_pickup_instructions?: string | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          precise_dropoff_latitude?: number | null
          precise_dropoff_longitude?: number | null
          precise_pickup_latitude?: number | null
          precise_pickup_longitude?: number | null
          price_per_seat?: number
          route_data?: Json | null
          route_polyline?: string | null
          status?: string | null
          to_city?: string
          toll_info?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "user_cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cars: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          license_plate: string | null
          make: string
          model: string
          updated_at: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_plate?: string | null
          make: string
          model: string
          updated_at?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_plate?: string | null
          make?: string
          model?: string
          updated_at?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      user_frequent_locations: {
        Row: {
          address: string
          created_at: string
          id: string
          last_used: string
          latitude: number | null
          location_name: string
          location_type: string
          longitude: number | null
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          last_used?: string
          latitude?: number | null
          location_name: string
          location_type?: string
          longitude?: number | null
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          last_used?: string
          latitude?: number | null
          location_name?: string
          location_type?: string
          longitude?: number | null
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_with_role: {
        Row: {
          avatar_url: string | null
          can_drive: boolean | null
          created_at: string | null
          id: string | null
          is_verified: boolean | null
          name: string | null
          phone: string | null
          rating: number | null
          role: string | null
          total_rides: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          can_drive?: never
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          name?: string | null
          phone?: string | null
          rating?: number | null
          role?: never
          total_rides?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          can_drive?: never
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          name?: string | null
          phone?: string | null
          rating?: number | null
          role?: never
          total_rides?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      complete_finished_rides: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deactivate_expired_rides: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_all_trips: {
        Args: { user_uuid: string }
        Returns: {
          trip_id: string
          trip_type: string
          from_city: string
          to_city: string
          departure_date: string
          departure_time: string
          status: string
          price_per_seat: number
          seats_count: number
          other_user_id: string
          other_user_name: string
          other_user_rating: number
          other_user_avatar: string
          created_at: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
