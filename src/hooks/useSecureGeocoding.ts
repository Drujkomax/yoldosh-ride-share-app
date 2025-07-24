import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeocodeResult {
  name: string;
  description: string;
  coordinates: [number, number];
}

interface RouteResult {
  distance: number;
  duration: number;
  coordinates: [number, number][];
}

export const useSecureGeocoding = () => {
  const [isLoading, setIsLoading] = useState(false);

  const geocodeAddress = async (address: string, service: 'google-maps' | 'yandex' | '2gis' = '2gis'): Promise<GeocodeResult[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('secure-geocoding', {
        body: {
          type: service,
          operation: 'geocode',
          query: address
        }
      });

      if (error) throw error;

      // Transform response based on service
      return transformGeocodingResponse(data, service);
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number, service: 'google-maps' | 'yandex' | '2gis' = '2gis'): Promise<string> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('secure-geocoding', {
        body: {
          type: service,
          operation: 'reverse',
          latitude,
          longitude
        }
      });

      if (error) throw error;

      return transformReverseGeocodingResponse(data, service);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return '';
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoute = async (origin: string, destination: string): Promise<RouteResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('secure-geocoding', {
        body: {
          type: 'google-maps',
          operation: 'directions',
          origin,
          destination
        }
      });

      if (error) throw error;

      return transformRouteResponse(data);
    } catch (error) {
      console.error('Route calculation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    geocodeAddress,
    reverseGeocode,
    calculateRoute,
    isLoading
  };
};

function transformGeocodingResponse(data: any, service: string): GeocodeResult[] {
  switch (service) {
    case 'google-maps':
      return data.results?.map((result: any) => ({
        name: result.formatted_address,
        description: result.formatted_address,
        coordinates: [result.geometry.location.lng, result.geometry.location.lat] as [number, number]
      })) || [];
    
    case 'yandex':
      const collection = data.response?.GeoObjectCollection;
      return collection?.featureMember?.map((feature: any) => {
        const geo = feature.GeoObject;
        const coords = geo.Point.pos.split(' ').map(Number);
        return {
          name: geo.name,
          description: geo.metaDataProperty.GeocoderMetaData.text,
          coordinates: [coords[0], coords[1]] as [number, number]
        };
      }) || [];
    
    case '2gis':
      return data.result?.items?.map((item: any) => ({
        name: item.name || item.full_name,
        description: item.full_name,
        coordinates: [item.point.lon, item.point.lat] as [number, number]
      })) || [];
    
    default:
      return [];
  }
}

function transformReverseGeocodingResponse(data: any, service: string): string {
  switch (service) {
    case 'google-maps':
      return data.results?.[0]?.formatted_address || '';
    
    case 'yandex':
      const collection = data.response?.GeoObjectCollection;
      return collection?.featureMember?.[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text || '';
    
    case '2gis':
      return data.result?.items?.[0]?.full_name || '';
    
    default:
      return '';
  }
}

function transformRouteResponse(data: any): RouteResult | null {
  if (!data.routes?.[0]) return null;

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    distance: leg.distance.value / 1000, // Convert to km
    duration: leg.duration.value / 60, // Convert to minutes
    coordinates: route.overview_polyline ? 
      decodePolyline(route.overview_polyline.points) : 
      []
  };
}

function decodePolyline(polyline: string): [number, number][] {
  // Basic polyline decoding - for production use a proper library
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < polyline.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}