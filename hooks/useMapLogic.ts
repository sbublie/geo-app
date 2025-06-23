'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { updateCircle } from "@/lib/shapes/circle";
import { getLocationInfo } from "@/lib/places";
import fetchWeatherData from "@/lib/weatherApi";
import { getTrainLinesInArea, createBoundingBoxFromCenter, TrainLine, getPowerLinesInArea, PowerLine } from "@/lib/osmApi";
import { drawLines, removeLines, LINE_STYLES, GenericLineFeature } from "@/lib/shapes/lines";
import WeatherData from '@/types/weatherData';
import { usePolygonDrawing } from '@/hooks/usePolygonDrawing';


export function useMapLogic() {
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const lastCircleParams = useRef<{ center: [number, number]; radius: number } | null>(null);
  const defaultLocation: [number, number] = [8.79053, 47.99143]; // Default coordinates for the map center
  const { clearAllPolygons } = usePolygonDrawing(map);

  const [coordinates, setCoordinates] = useState<{ lng: number; lat: number }>({ lng: defaultLocation[0], lat: defaultLocation[1] });
  const [locationInfo, setLocationInfo] = useState<{ street: string; city: string }>({ street: '', city: '' });
  const [radius, setRadius] = useState<number>(500);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [appState, setGameState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState<GenericLineFeature | null>(null);
  
  // Filter states
  const [showTrainLines, setShowTrainLines] = useState(true);
  const [showPowerLines, setShowPowerLines] = useState(true);
  const [trainLinesData, setTrainLinesData] = useState<TrainLine[]>([]);
  const [powerLinesData, setPowerLinesData] = useState<PowerLine[]>([]);

  const handleMapLoad = useCallback((mapRef: React.MutableRefObject<mapboxgl.Map | null>) => {
    map.current = mapRef.current;
    
    // Initial setup
    getLocationInfo(defaultLocation[0], defaultLocation[1]).then(setLocationInfo);
    updateCircle(defaultLocation, radius, map, lastCircleParams);
    fetchWeatherData(defaultLocation[0], defaultLocation[1], setWeatherData, setWeatherLoading);
    setMapLoaded(true);
  }, [radius]);

  const handleMarkerDragEnd = useCallback((lngLat: mapboxgl.LngLat) => {
    const roundedCoords = {
      lng: Math.round(lngLat.lng * 100000) / 100000,
      lat: Math.round(lngLat.lat * 100000) / 100000
    };
    setCoordinates(roundedCoords);
    getLocationInfo(lngLat.lng, lngLat.lat).then(setLocationInfo);
    updateCircle([lngLat.lng, lngLat.lat], radius, map, lastCircleParams);
    fetchWeatherData(roundedCoords.lat, roundedCoords.lng, setWeatherData, setWeatherLoading);
  }, [radius]);

  // Update circle when radius changes
  useEffect(() => {
    if (map.current && marker.current) {
      const lngLat = marker.current.getLngLat();
      updateCircle([lngLat.lng, lngLat.lat], radius, map, lastCircleParams);
    }
  }, [radius]);

  // Handle filter toggles
  const handleToggleTrainLines = useCallback((show: boolean) => {
    setShowTrainLines(show);
    if (show && trainLinesData.length > 0) {
      drawLines(trainLinesData, "railway", map, setSelectedLine);
    } else {
      removeLines("railway", map);
      setSelectedLine(null);
    }
  }, [trainLinesData]);

  const handleTogglePowerLines = useCallback((show: boolean) => {
    setShowPowerLines(show);
    if (show && powerLinesData.length > 0) {
      drawLines(powerLinesData, "power", map, setSelectedLine);
    } else {
      removeLines("power", map);
      setSelectedLine(null);
    }
  }, [powerLinesData]);

  const startGame = useCallback(async () => {
    setGameState('loading');
    try {
      const boundingBox = createBoundingBoxFromCenter(coordinates.lat, coordinates.lng, radius / 1000);
      const trainLines = await getTrainLinesInArea(boundingBox);
      const powerLines = await getPowerLinesInArea(boundingBox);

      setTrainLinesData(trainLines);
      setPowerLinesData(powerLines);

      if (showTrainLines) {
        drawLines(trainLines, "railway", map, setSelectedLine);
      }
      if (showPowerLines) {
        drawLines(powerLines, "power", map, setSelectedLine);
      }

      setGameState('playing');
    } catch (error) {
      console.error('Failed to load game elements:', error);
      setGameState('idle');
    }
  }, [coordinates, radius, showTrainLines, showPowerLines]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setSelectedLine(null);
    removeLines("power", map);
    removeLines("railway", map);
    setTrainLinesData([]);
    setPowerLinesData([]);
    // Clear all polygons on reset
    clearAllPolygons();
  }, [map, clearAllPolygons]);

  return {
    // State
    coordinates,
    locationInfo,
    radius,
    setRadius,
    mapLoaded,
    appState,
    weatherData,
    weatherLoading,
    showTrainLines,
    showPowerLines,
    trainLinesData,
    powerLinesData,
    selectedLine,
    setSelectedLine,
    // Handlers
    handleMapLoad,
    handleMarkerDragEnd,
    startGame,
    resetGame,
    handleToggleTrainLines,
    handleTogglePowerLines,
    // Refs
    map,
    marker,
    lastCircleParams
  };
}