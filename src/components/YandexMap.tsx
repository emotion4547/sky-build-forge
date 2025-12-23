import { useEffect, useRef } from "react";

declare global {
  interface Window {
    ymaps: any;
  }
}

interface YandexMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  markerTitle?: string;
  className?: string;
}

export function YandexMap({ lat, lng, zoom = 16, markerTitle = "СКБ УРАЛ56", className = "" }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const loadYandexMaps = () => {
      return new Promise<void>((resolve) => {
        if (window.ymaps) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU";
        script.async = true;
        script.onload = () => {
          window.ymaps.ready(() => resolve());
        };
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      await loadYandexMaps();

      if (!mapRef.current || mapInstanceRef.current) return;

      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: [lat, lng],
        zoom: zoom,
        controls: ["zoomControl", "fullscreenControl"],
      });

      const placemark = new window.ymaps.Placemark(
        [lat, lng],
        {
          hintContent: markerTitle,
          balloonContentHeader: markerTitle,
          balloonContentBody: "460019, Оренбургская область, г. Оренбург,<br/>мкр. Посёлок Кушкуль, ул. Просвещения, д. 19/4",
          balloonContentFooter: '<a href="tel:+79325369129">+7 (932) 536-91-29</a>',
        },
        {
          preset: "islands#darkGreenDotIcon",
        }
      );

      mapInstanceRef.current.geoObjects.add(placemark);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom, markerTitle]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full min-h-[300px] rounded-xl overflow-hidden ${className}`}
    />
  );
}
