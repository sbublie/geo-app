'use client';

import { useState, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { getLocationInfo } from "@/lib/places";
import { updateCircle } from "@/lib/shapes/circle";
import fetchWeatherData from "@/lib/weatherApi";
import { getTrainLinesInArea, createBoundingBoxFromCenter, TrainLine, getPowerLinesInArea, PowerLine } from "@/lib/osmApi";
import { drawTrainLines, drawPowerLines, removeInfrastructureLines } from "@/lib/shapes/lines";
import WeatherData from '@/types/weatherData';

export function useMapLogic() {
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const lastCircleParams = useRef<{ center: [number, number]; radius: number } | null>(null);

  const [coordinates, setCoordinates] = useState<{ lng: number; lat: number }>({ lng: 9, lat: 48 });
  const [locationInfo, setLocationInfo] = useState<{ street: string; city: string }>({ street: '', city: '' });
  const [radius, setRadius] = useState<number>(2000);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedTrainLine, setSelectedTrainLine] = useState<TrainLine | null>(null);
  const [selectedPowerLine, setSelectedPowerLine] = useState<PowerLine | null>(null);
  
  // Filter states
  const [showTrainLines, setShowTrainLines] = useState(true);
  const [showPowerLines, setShowPowerLines] = useState(true);
  const [trainLinesData, setTrainLinesData] = useState<TrainLine[]>([]);
  const [powerLinesData, setPowerLinesData] = useState<PowerLine[]>([]);

  const handleMapLoad = useCallback((mapRef: React.MutableRefObject<mapboxgl.Map | null>) => {
    map.current = mapRef.current;
    
    // Initial setup
    getLocationInfo(9, 48).then(setLocationInfo);
    updateCircle([9, 48], radius, map, lastCircleParams);
    fetchWeatherData(9, 48, setWeatherData, setWeatherLoading);
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

  // Handle filter toggles
  const handleToggleTrainLines = useCallback((show: boolean) => {
    setShowTrainLines(show);
    if (show && trainLinesData.length > 0) {
      drawTrainLines(trainLinesData, map, setSelectedTrainLine);
    } else {
      removeInfrastructureLines('railway', map);
      setSelectedTrainLine(null);
    }
  }, [trainLinesData]);

  const handleTogglePowerLines = useCallback((show: boolean) => {
    setShowPowerLines(show);
    if (show && powerLinesData.length > 0) {
      drawPowerLines(powerLinesData, map, setSelectedPowerLine);
    } else {
      removeInfrastructureLines('power', map);
      setSelectedPowerLine(null);
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
        drawTrainLines(trainLines, map, setSelectedTrainLine);
      }
      if (showPowerLines) {
        drawPowerLines(powerLines, map, setSelectedPowerLine);
      }

      setGameState('playing');
    } catch (error) {
      console.error('Failed to load game elements:', error);
      setGameState('idle');
    }
  }, [coordinates, radius, showTrainLines, showPowerLines]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setSelectedTrainLine(null);
    setSelectedPowerLine(null);
    removeInfrastructureLines('power', map);
    removeInfrastructureLines('railway', map);
    setTrainLinesData([]);
    setPowerLinesData([]);
  }, []);

  return {
    // State
    coordinates,
    locationInfo,
    radius,
    setRadius,
    mapLoaded,
    gameState,
    weatherData,
    weatherLoading,
    showTrainLines,
    showPowerLines,
    trainLinesData,
    powerLinesData,
    selectedTrainLine,
    selectedPowerLine,
    setSelectedTrainLine,
    setSelectedPowerLine,
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