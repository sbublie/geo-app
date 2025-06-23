'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { updateCircle } from "@/lib/shapes/circle";
import { getLocationInfo } from "@/lib/api/placesApi";
import fetchWeatherData from "@/lib/api/weatherApi";
import { 
  getInfrastructureLinesInArea, 
  createBoundingBoxFromCenter
} from "@/lib/api/osmApi";
import GenericLine from '@/types/GenericLine';
import { drawLines, removeLines, GenericLineFeature } from "@/lib/shapes/lines";
import WeatherData from '@/types/WeatherData';
import { usePolygonDrawing } from '@/hooks/usePolygonDrawing';
import { LineType } from '@/types/LineConfig';
import { lineConfig } from '@/lib/config/lineConfig';

const ENABLED_LINE_TYPES: LineType[] = Object.keys(lineConfig) as LineType[];

export function useMapLogic() {
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const lastCircleParams = useRef<{ center: [number, number]; radius: number } | null>(null);
  const defaultLocation: [number, number] = [8.79053, 47.99143];
  const { clearAllPolygons } = usePolygonDrawing(map);

  const [coordinates, setCoordinates] = useState<{ lng: number; lat: number }>({ 
    lng: defaultLocation[0], 
    lat: defaultLocation[1] 
  });
  const [locationInfo, setLocationInfo] = useState<{ street: string; city: string }>({ street: '', city: '' });
  const [radius, setRadius] = useState<number>(250);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [appState, setGameState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState<GenericLineFeature | null>(null);
  
  // Generic line visibility state
  const [lineVisibility, setLineVisibility] = useState<Record<LineType, boolean>>(
    ENABLED_LINE_TYPES.reduce((acc, type) => ({ ...acc, [type]: true }), {} as Record<LineType, boolean>)
  );
  
  // Generic line data storage
  const [lineData, setLineData] = useState<Record<LineType, GenericLine[]>>(
    ENABLED_LINE_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<LineType, GenericLine[]>)
  );

  const handleMapLoad = useCallback((mapRef: React.MutableRefObject<mapboxgl.Map | null>) => {
    map.current = mapRef.current;
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

  // Generic toggle function for any line type
  const handleToggleLineType = useCallback((lineType: LineType, show: boolean) => {
    setLineVisibility(prev => ({ ...prev, [lineType]: show }));
    if (show && lineData[lineType].length > 0) {
      drawLines(lineData[lineType], lineType , map, setSelectedLine);
    } else {
      removeLines(lineType, map);
      setSelectedLine(null);
    }
  }, [lineData]);

  // Create specific handlers for each enabled line type (optional, for legacy compatibility)
  const lineTypeHandlers = ENABLED_LINE_TYPES.reduce((handlers, lineType) => {
    handlers[`handleToggle${lineType.charAt(0).toUpperCase()}${lineType.slice(1)}Lines`] = 
      (show: boolean) => handleToggleLineType(lineType, show);
    return handlers;
  }, {} as Record<string, (show: boolean) => void>);

  const startGame = useCallback(async () => {
    setGameState('loading');
    try {
      const boundingBox = createBoundingBoxFromCenter(coordinates.lat, coordinates.lng, radius / 1000);
      // Fetch all enabled line types in parallel
      const linePromises = ENABLED_LINE_TYPES.map(async (lineType) => {
        const lines = await getInfrastructureLinesInArea(boundingBox, lineType);
        return { lineType, lines };
      });

      const lineResults = await Promise.all(linePromises);
      // Update line data state
      const newLineData = { ...lineData };
      lineResults.forEach(({ lineType, lines }) => {
        newLineData[lineType] = lines;
      });
      setLineData(newLineData);

      // Draw visible line types
      ENABLED_LINE_TYPES.forEach((lineType) => {
        if (lineVisibility[lineType] && newLineData[lineType].length > 0) {
          drawLines(newLineData[lineType], lineType, map, setSelectedLine);
        }
      });

      setGameState('playing');
    } catch (error) {
      console.error('Failed to load game elements:', error);
      setGameState('idle');
    }
  }, [coordinates, radius, lineVisibility, lineData]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setSelectedLine(null);
    // Remove all line types from map
    ENABLED_LINE_TYPES.forEach(lineType => {
      removeLines(lineType, map);
    });
    // Clear all line data
    setLineData(ENABLED_LINE_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<LineType, GenericLine[]>));
    // Clear all polygons on reset
    clearAllPolygons();
  }, [map, clearAllPolygons]);

  // Helper function to get line type from selected line
  const getSelectedLineType = useCallback((line: GenericLineFeature | null): LineType => {
    if (!line?.properties) return "highway";
    for (const lineType of ENABLED_LINE_TYPES) {
      const config = lineConfig[lineType];
      if (line.properties[config.tagKey]) {
        return lineType;
      }
    }
    return "highway";
  }, []);

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
    selectedLine,
    setSelectedLine,
    // Generic line state
    lineVisibility,
    lineData,
    enabledLineTypes: ENABLED_LINE_TYPES,
    // Handlers
    handleMapLoad,
    handleMarkerDragEnd,
    startGame,
    resetGame,
    handleToggleLineType,
    getSelectedLineType,
    // Specific line type handlers for backward compatibility
    ...lineTypeHandlers,
    // Refs
    map,
    marker,
    lastCircleParams
  };
}

// Export helper functions
export function getEnabledLineTypes(): LineType[] {
  return ENABLED_LINE_TYPES;
}

export function getLineTypeConfig(lineType: LineType) {
  return lineConfig[lineType];
}