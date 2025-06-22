'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { mapbox_style } from "@/components/mapbox_style";

interface MapContainerProps {
  onMapLoad: (map: React.MutableRefObject<mapboxgl.Map | null>) => void;
  onMarkerDragEnd: (lngLat: mapboxgl.LngLat) => void;
  gameState: 'idle' | 'loading' | 'playing';
  coordinates: { lng: number; lat: number };
  radius: number;
}

export default function MapContainer({ 
  onMapLoad, 
  onMarkerDragEnd, 
  gameState, 
  coordinates
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapbox_style as any,
        center: [9, 48],
        zoom: 13
      });

      map.current.on('load', () => {
        marker.current = new mapboxgl.Marker({
          draggable: true,
          color: '#ff0000'
        })
          .setLngLat([9, 48])
          .addTo(map.current!);

        marker.current.on('dragend', () => {
          const lngLat = marker.current!.getLngLat();
          onMarkerDragEnd(lngLat);
        });

        onMapLoad(map);
      });
    }
  }, [onMapLoad, onMarkerDragEnd]);

  // Update marker based on game state and coordinates
  useEffect(() => {
    if (!marker.current) return;

    const isDraggable = gameState !== 'playing';
    marker.current.setDraggable(isDraggable);
    marker.current.setLngLat([coordinates.lng, coordinates.lat]);

    const markerElement = marker.current.getElement();
    const svgElement = markerElement.querySelector('svg');
    if (svgElement) {
      const path = svgElement.querySelector('path');
      if (path) {
        path.setAttribute('fill', isDraggable ? '#ff0000' : '#666666');
      }
    }
  }, [gameState, coordinates]);

  return <div ref={mapContainer} className="w-full h-full" />;
}