
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MapContextType {
  isLoaded: boolean;
  mapgl: any;
}

const MapContext = createContext<MapContextType>({
  isLoaded: false,
  mapgl: null
});

export const use2GisMap = () => useContext(MapContext);

interface MapProviderProps {
  children: React.ReactNode;
}

export const MapProvider2Gis = ({ children }: MapProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapgl, setMapgl] = useState<any>(null);

  useEffect(() => {
    const init2GisMaps = async () => {
      if (window.mapgl) {
        setMapgl(window.mapgl);
        setIsLoaded(true);
        return;
      }

      // Загружаем 2GIS MapGL JS API
      const script = document.createElement('script');
      script.src = 'https://mapgl.2gis.com/api/js/v1';
      script.async = true;
      
      script.onload = () => {
        if (window.mapgl) {
          setMapgl(window.mapgl);
          setIsLoaded(true);
        }
      };

      script.onerror = () => {
        console.error('Failed to load 2GIS MapGL API');
      };

      document.head.appendChild(script);
    };

    init2GisMaps();
  }, []);

  return (
    <MapContext.Provider value={{ isLoaded, mapgl }}>
      {children}
    </MapContext.Provider>
  );
};

declare global {
  interface Window {
    mapgl: any;
  }
}
