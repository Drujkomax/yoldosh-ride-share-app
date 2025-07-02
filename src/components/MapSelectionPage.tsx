import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Navigation, Check } from 'lucide-react';

interface MapSelectionPageProps {
  title: string;
  initialAddress: string;
  initialCoordinates: [number, number];
  onLocationSelect: (coordinates: [number, number], address: string) => void;
  onBack: () => void;
}

const MapSelectionPage = ({
  title,
  initialAddress,
  initialCoordinates,
  onLocationSelect,
  onBack
}: MapSelectionPageProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>(initialCoordinates);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: initialCoordinates[0], lng: initialCoordinates[1] },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      geocoder.current = new google.maps.Geocoder();

      const markerInstance = new google.maps.Marker({
        position: { lat: initialCoordinates[0], lng: initialCoordinates[1] },
        map: mapInstance,
        draggable: true,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      });

      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          const coords: [number, number] = [position.lat(), position.lng()];
          setSelectedCoords(coords);
          updateAddress(coords);
        }
      });

      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const coords: [number, number] = [e.latLng.lat(), e.latLng.lng()];
          markerInstance.setPosition(e.latLng);
          setSelectedCoords(coords);
          updateAddress(coords);
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);
    };

    if (window.google) {
      initializeMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCJSjDFNJvtX9BS2UGQ1QAFq7yLiid7d68&libraries=places&language=ru`;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
  }, []);

  const updateAddress = async (coords: [number, number]) => {
    if (!geocoder.current) return;

    try {
      geocoder.current.geocode(
        { location: { lat: coords[0], lng: coords[1] } },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            setSelectedAddress(results[0].formatted_address);
          }
        }
      );
    } catch (error) {
      console.error('Error geocoding:', error);
    }
  };

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setSelectedCoords(coords);
          
          if (map && marker) {
            const latLng = new google.maps.LatLng(coords[0], coords[1]);
            map.setCenter(latLng);
            marker.setPosition(latLng);
            updateAddress(coords);
          }
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedCoords, selectedAddress);
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
          </div>
        </div>

        {/* Current location button */}
        <Button
          onClick={handleCurrentLocation}
          className="absolute top-4 right-4 p-3 bg-white shadow-lg hover:bg-gray-50"
          variant="outline"
        >
          <Navigation className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="mb-4">
          <div className="font-medium text-gray-900 mb-1">Выбранный адрес:</div>
          <div className="text-gray-600 text-sm">{selectedAddress}</div>
        </div>
        
        <Button 
          onClick={handleConfirm}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
        >
          <Check className="h-5 w-5 mr-2" />
          Подтвердить местоположение
        </Button>
      </div>
    </div>
  );
};

export default MapSelectionPage;