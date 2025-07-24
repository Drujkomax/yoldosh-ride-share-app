import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodingRequest {
  type: 'google-maps'
  operation: 'geocode' | 'reverse' | 'directions'
  query?: string
  latitude?: number
  longitude?: number
  origin?: string
  destination?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, operation, query, latitude, longitude, origin, destination }: GeocodingRequest = await req.json()

    let apiUrl = ''
    let headers: Record<string, string> = {}

    switch (type) {
      case 'google-maps':
        const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
        if (!googleApiKey) {
          throw new Error('Google Maps API key not configured')
        }
        
        switch (operation) {
          case 'geocode':
            apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query || '')}&key=${googleApiKey}&language=ru`
            break
          case 'reverse':
            apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}&language=ru`
            break
          case 'directions':
            apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin || '')}&destination=${encodeURIComponent(destination || '')}&key=${googleApiKey}&language=ru`
            break
        }
        break

      case 'yandex':
        const yandexApiKey = Deno.env.get('YANDEX_MAPS_API_KEY')
        if (!yandexApiKey) {
          throw new Error('Yandex Maps API key not configured')
        }
        
        switch (operation) {
          case 'geocode':
            apiUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&geocode=${encodeURIComponent(query + ', Узбекистан')}&format=json&results=10&lang=ru_RU&kind=house`
            break
          case 'reverse':
            apiUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&geocode=${longitude},${latitude}&format=json&lang=ru_RU`
            break
        }
        break

      case '2gis':
        const twoGisApiKey = Deno.env.get('TWOGIS_API_KEY')
        if (!twoGisApiKey) {
          throw new Error('2GIS API key not configured')
        }
        
        switch (operation) {
          case 'geocode':
            apiUrl = `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(query || '')}&key=${twoGisApiKey}&location=69.240073,41.311081&radius=50000&fields=items.point&locale=ru_RU`
            break
          case 'reverse':
            apiUrl = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${latitude}&lon=${longitude}&key=${twoGisApiKey}&fields=items.point&locale=ru_RU`
            break
        }
        break

      default:
        throw new Error('Invalid geocoding service type')
    }

    const response = await fetch(apiUrl, { headers })
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Geocoding error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})