
import React, { createContext, useContext, useEffect, useState } from 'react';

interface YandexMapContextType {
  isLoaded: boolean;
  ymaps: any;
}

const YandexMapContext = createContext<YandexMapContextType>({
  isLoaded: false,
  ymaps: null
});

export const useYandexMap = () => useContext(YandexMapContext);

interface YandexMapProviderProps {
  children: React.ReactNode;
}

export const YandexMapProvider = ({ children }: YandexMapProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ymaps, setYmaps] = useState<any>(null);

  useEffect(() => {
    const initYandexMaps = async () => {
      if (window.ymaps) {
        await window.ymaps.ready();
        setYmaps(window.ymaps);
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=e50140a7-ffa3-493f-86d6-e25b5d1bfb17&lang=ru_RU';
      script.async = true;
      
      script.onload = () => {
        window.ymaps.ready(() => {
          setYmaps(window.ymaps);
          setIsLoaded(true);
        });
      };

      document.head.appendChild(script);
    };

    initYandexMaps();
  }, []);

  return (
    <YandexMapContext.Provider value={{ isLoaded, ymaps }}>
      {children}
    </YandexMapContext.Provider>
  );
};

declare global {
  interface Window {
    ymaps: any;
  }
}
