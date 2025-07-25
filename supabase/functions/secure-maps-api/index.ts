import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MapsApiRequest {
  service: 'google' | 'yandex' | '2gis';
  operation: 'geocode' | 'reverse' | 'autocomplete' | 'details' | 'directions';
  query?: string;
  lat?: number;
  lng?: number;
  place_id?: string;
  origin?: string;
  destination?: string;
  waypoints?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: MapsApiRequest = await req.json();
    const { service, operation, query, lat, lng, place_id, origin, destination, waypoints } = requestData;

    let apiUrl = '';
    let apiKey = '';

    switch (service) {
      case 'google':
        apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
        if (!apiKey) {
          throw new Error('Google Maps API key not configured');
        }

        switch (operation) {
          case 'autocomplete':
            apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query || '')}&key=${apiKey}`;
            break;
          case 'details':
            apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}`;
            break;
          case 'geocode':
            apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query || '')}&key=${apiKey}`;
            break;
          case 'reverse':
            apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
            break;
          case 'directions':
            apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin || '')}&destination=${encodeURIComponent(destination || '')}&key=${apiKey}`;
            if (waypoints) {
              apiUrl += `&waypoints=${encodeURIComponent(waypoints)}`;
            }
            break;
          default:
            throw new Error('Unsupported Google Maps operation');
        }
        break;

      case 'yandex':
        apiKey = Deno.env.get('YANDEX_MAPS_API_KEY');
        if (!apiKey) {
          throw new Error('Yandex Maps API key not configured');
        }

        switch (operation) {
          case 'geocode':
            apiUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(query || '')}&format=json`;
            break;
          case 'reverse':
            apiUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${lng},${lat}&format=json`;
            break;
          default:
            throw new Error('Unsupported Yandex Maps operation');
        }
        break;

      case '2gis':
        apiKey = Deno.env.get('TWOGIS_API_KEY');
        if (!apiKey) {
          throw new Error('2GIS API key not configured');
        }

        switch (operation) {
          case 'geocode':
            apiUrl = `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(query || '')}&fields=items.point&key=${apiKey}`;
            break;
          case 'reverse':
            apiUrl = `https://catalog.api.2gis.com/3.0/items/geocode?point=${lng},${lat}&fields=items.point&key=${apiKey}`;
            break;
          default:
            throw new Error('Unsupported 2GIS operation');
        }
        break;

      default:
        throw new Error('Unsupported service');
    }

    console.log(`Making API request to: ${apiUrl.replace(apiKey, '[API_KEY]')}`);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Secure Maps API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});