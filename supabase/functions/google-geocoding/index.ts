
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, type = 'autocomplete', origin, destination } = await req.json()
    const GOOGLE_API_KEY = 'AIzaSyCJSjDFNJvtX9BS2UGQ1QAFq7yLiid7d68'

    let url = ''
    
    if (type === 'autocomplete') {
      // Комбинированный поиск для городов и улиц в Узбекистане
      url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&language=ru&components=country:uz&types=geocode|establishment&region=uz`
    } else if (type === 'details') {
      url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${query}&key=${GOOGLE_API_KEY}&fields=geometry,formatted_address,name,types&language=ru`
    } else if (type === 'reverse') {
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${query}&key=${GOOGLE_API_KEY}&language=ru`
    } else if (type === 'directions') {
      url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${GOOGLE_API_KEY}&language=ru&mode=driving`
    }

    console.log('Calling Google API:', url)
    
    const response = await fetch(url)
    const data = await response.json()

    console.log('Google API response:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in google-geocoding function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
