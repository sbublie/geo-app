"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

const defaultLocation: [number, number] = [8.79053, 47.99143];

interface MapContainerProps {
  onMapLoad: (map: React.MutableRefObject<mapboxgl.Map | null>) => void;
  onMarkerDragEnd: (lngLat: mapboxgl.LngLat) => void;
  appState: "idle" | "loading" | "playing";
  coordinates: { lng: number; lat: number };
  radius: number;
  markerRef: React.MutableRefObject<mapboxgl.Marker | null>;
  mapStyle: string;
}

export default function MapContainer({
  onMapLoad,
  onMarkerDragEnd,
  appState,
  coordinates,
  markerRef,
  mapStyle,
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: defaultLocation,
        zoom: 16,
      });

      map.current.on("load", () => {
        markerRef.current = new mapboxgl.Marker({
          draggable: true,
          color: "#ff0000",
        })
          .setLngLat(defaultLocation)
          .addTo(map.current!);

        markerRef.current.on("dragend", () => {
          const lngLat = markerRef.current!.getLngLat();
          onMarkerDragEnd(lngLat);
        });

        onMapLoad(map);
      });
    }
  }, [onMapLoad, onMarkerDragEnd, markerRef, mapStyle]);

  // Update marker based on game state and coordinates
  useEffect(() => {
    if (!markerRef.current) return;

    const isDraggable = appState !== "playing";
    markerRef.current.setDraggable(isDraggable);
    markerRef.current.setLngLat([coordinates.lng, coordinates.lat]);

    const markerElement = markerRef.current.getElement();
    const svgElement = markerElement.querySelector("svg");
    if (svgElement) {
      const path = svgElement.querySelector("path");
      if (path) {
        path.setAttribute("fill", isDraggable ? "#ff0000" : "#666666");
      }
    }
  }, [appState, coordinates, markerRef]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
