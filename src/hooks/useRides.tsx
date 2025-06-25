
import { useState, useEffect } from 'react'
import { supabase, Ride, RideRequest, Booking } from '@/lib/supabase'
import { useAuth } from './useAuth'

export const useRides = () => {
  const { user } = useAuth()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(false)

  const searchRides = async (filters: {
    from_city: string
    to_city: string
    departure_date: string
    passengers: number
  }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:users(id, name, phone, is_verified)
        `)
        .eq('from_city', filters.from_city)
        .eq('to_city', filters.to_city)
        .eq('departure_date', filters.departure_date)
        .gte('available_seats', filters.passengers)
        .eq('status', 'active')
        .order('departure_time')

      if (error) throw error
      setRides(data || [])
      return data || []
    } catch (error) {
      console.error('Error searching rides:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const createRide = async (rideData: Omit<Ride, 'id' | 'created_at' | 'driver_id'>) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('rides')
      .insert([
        {
          ...rideData,
          driver_id: user.id,
          status: 'active'
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  const bookRide = async (rideId: string, seatsCount: number) => {
    if (!user) throw new Error('User not authenticated')

    // Get ride details
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('price_per_seat')
      .eq('id', rideId)
      .single()

    if (rideError) throw rideError

    const totalPrice = ride.price_per_seat * seatsCount

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          ride_id: rideId,
          passenger_id: user.id,
          seats_booked: seatsCount,
          total_price: totalPrice,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  const getUserRides = async () => {
    if (!user) return []

    setLoading(true)
    try {
      if (user.role === 'driver') {
        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      } else {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            ride:rides(
              *,
              driver:users(id, name, phone)
            )
          `)
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      }
    } catch (error) {
      console.error('Error fetching user rides:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    rides,
    loading,
    searchRides,
    createRide,
    bookRide,
    getUserRides
  }
}

export const useRideRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RideRequest[]>([])
  const [loading, setLoading] = useState(false)

  const createRequest = async (requestData: Omit<RideRequest, 'id' | 'created_at' | 'passenger_id'>) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('ride_requests')
      .insert([
        {
          ...requestData,
          passenger_id: user.id,
          status: 'active'
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  const searchRequests = async (filters?: {
    from_city?: string
    to_city?: string
    preferred_date?: string
  }) => {
    setLoading(true)
    try {
      let query = supabase
        .from('ride_requests')
        .select(`
          *,
          passenger:users(id, name, phone, is_verified)
        `)
        .eq('status', 'active')

      if (filters?.from_city) query = query.eq('from_city', filters.from_city)
      if (filters?.to_city) query = query.eq('to_city', filters.to_city)
      if (filters?.preferred_date) query = query.eq('preferred_date', filters.preferred_date)

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
      return data || []
    } catch (error) {
      console.error('Error searching requests:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    requests,
    loading,
    createRequest,
    searchRequests
  }
}
