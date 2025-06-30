
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export const useGooglePlaces = () => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchPlaces = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-geocoding', {
        body: {
          query: input,
          type: 'autocomplete'
        }
      });

      if (error) {
        console.error('Error calling google-geocoding function:', error);
        setPredictions([]);
        return;
      }
      
      if (data && data.predictions) {
        // Filter to focus on Uzbekistan cities and streets
        const uzbekistanPredictions = data.predictions.filter((prediction: PlacePrediction) => 
          prediction.description.toLowerCase().includes('узбекистан') ||
          prediction.description.toLowerCase().includes('uzbekistan') ||
          prediction.structured_formatting.secondary_text?.toLowerCase().includes('узбекистан') ||
          prediction.structured_formatting.secondary_text?.toLowerCase().includes('uzbekistan')
        );
        setPredictions(uzbekistanPredictions);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('google-geocoding', {
        body: {
          query: placeId,
          type: 'details'
        }
      });

      if (error) {
        console.error('Error calling google-geocoding function:', error);
        return null;
      }
      
      if (data && data.result) {
        return data.result;
      }
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }, []);

  const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number; address: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const { data, error } = await supabase.functions.invoke('google-geocoding', {
              body: {
                query: `${latitude},${longitude}`,
                type: 'reverse'
              }
            });

            if (error) {
              console.error('Error calling google-geocoding function:', error);
              resolve({
                lat: latitude,
                lng: longitude,
                address: 'Текущее местоположение'
              });
              return;
            }

            const address = data?.results?.[0]?.formatted_address || 'Текущее местоположение';
            
            resolve({
              lat: latitude,
              lng: longitude,
              address
            });
          } catch (error) {
            resolve({
              lat: latitude,
              lng: longitude,
              address: 'Текущее местоположение'
            });
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }, []);

  return {
    predictions,
    isLoading,
    searchPlaces,
    getPlaceDetails,
    getCurrentLocation
  };
};
