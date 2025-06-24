'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { updateCircle } from "@/lib/shapes/circle";
import { getLocationInfo } from "@/lib/api/placesApi";
import fetchWeatherData from "@/lib/api/weatherApi";
import { 
  getAllInfrastructureLines
} from "@/lib/api/osmApi";
import createBoundingBoxFromCenter from '@/lib/shapes/boundingBox';
import GenericLine from '@/types/GenericLine';
import { drawLines, removeLines, GenericLineFeature } from "@/lib/shapes/lines";
import WeatherData from '@/types/WeatherData';
import { usePolygonDrawing } from '@/hooks/usePolygonDrawing';
import { LineType } from '@/types/LineConfig';
import { NodeType } from '@/types/NodeConfig';
import { lineConfig } from '@/lib/config/lineConfig';
import { getAllInfrastructureNodes } from '@/lib/api/fetchOsmNodes';
import { nodeConfig } from '@/lib/config/nodeConfig';
import { addMarkers, removeAllMarkers, removeMarkers } from '@/lib/shapes/marker';
import GenericNode from '@/types/GenericNode';
import { SelectedNodeWithPoint } from '@/lib/shapes/marker';
import { SelectedLineWithPoint } from '@/lib/shapes/lines';
import { AreaType } from '@/types/AreaConfig';
import { areaConfig } from '@/lib/config/areaConfig';
import { getAllInfrastructureAreas } from '@/lib/api/fetchOsmAreas';
import { drawAreas, removeAreas, SelectedAreaWithPoint } from '@/lib/shapes/area';
import GenericArea from '@/types/GenericArea';

const ENABLED_LINE_TYPES: LineType[] = Object.keys(lineConfig) as LineType[];
const ENABLED_NODE_TYPES: NodeType[] = Object.keys(nodeConfig) as NodeType[];
const ENABLED_AREA_TYPES: AreaType[] = Object.keys(areaConfig) as AreaType[];

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
  const [selectedObject, setSelectedObject] = useState<SelectedLineWithPoint | SelectedNodeWithPoint | SelectedAreaWithPoint | null>(null);
  
  // Generic line visibility state
  const [lineVisibility, setLineVisibility] = useState<Record<LineType, boolean>>(
    ENABLED_LINE_TYPES.reduce((acc, type) => ({ ...acc, [type]: true }), {} as Record<LineType, boolean>)
  );
  
  // Generic node visibility state
  const [nodeVisibility, setNodeVisibility] = useState<Record<NodeType, boolean>>(
    ENABLED_NODE_TYPES.reduce((acc, type) => ({ ...acc, [type]: true }), {} as Record<NodeType, boolean>)
  );
  
  // Generic area visibility state
  const [areaVisibility, setAreaVisibility] = useState<Record<AreaType, boolean>>(
    ENABLED_AREA_TYPES.reduce((acc, type) => ({ ...acc, [type]: true }), {} as Record<AreaType, boolean>)
  );
  
  // Generic line data storage
  const [lineData, setLineData] = useState<Record<LineType, GenericLine[]>>(
    ENABLED_LINE_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<LineType, GenericLine[]>)
  );

  // Generic node data storage
  const [nodeData, setNodeData] = useState<Record<NodeType, GenericNode[]>>(
    ENABLED_NODE_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<NodeType, GenericNode[]>)
  );

  // Generic area data storage
  const [areaData, setAreaData] = useState<Record<AreaType, GenericArea[]>>(
    ENABLED_AREA_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<AreaType, GenericArea[]>)
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
      drawLines(lineData[lineType], lineType, map, setSelectedObject);
    } else {
      removeLines(lineType, map);
      setSelectedObject(null);
    }
  }, [lineData]);

  // Generic toggle function for any node type
  const handleToggleNodeType = useCallback((nodeType: NodeType, show: boolean) => {
    setNodeVisibility(prev => ({ ...prev, [nodeType]: show }));
    if (show && nodeData[nodeType].length > 0) {
      addMarkers(map, nodeData[nodeType], nodeType, setSelectedObject);
    } else {
      removeMarkers(nodeType, map, nodeData);
      setSelectedObject(null);
    }
  }, [nodeData]);

  // Generic toggle function for any area type
  const handleToggleAreaType = useCallback((areaType: AreaType, show: boolean) => {
    setAreaVisibility(prev => ({ ...prev, [areaType]: show }));
    if (show && areaData[areaType].length > 0) {
      drawAreas(areaData[areaType], areaType, map, setSelectedObject);
    } else {
      removeAreas(areaType, map);
      setSelectedObject(null);
    }
  }, [areaData]);

  const startGame = useCallback(async () => {
    setGameState('loading');
    try {
      const boundingBox = createBoundingBoxFromCenter(coordinates.lat, coordinates.lng, radius / 1000);
      const allLines = await getAllInfrastructureLines(boundingBox, ENABLED_LINE_TYPES);
      const allNodes = await getAllInfrastructureNodes(boundingBox);
      const allAreas = await getAllInfrastructureAreas(boundingBox);
      
      setLineData(allLines);
      setNodeData(allNodes);
      setAreaData(allAreas);

      // Add markers for visible node types
      ENABLED_NODE_TYPES.forEach((nodeType) => {
        if (nodeVisibility[nodeType] && allNodes[nodeType].length > 0) {
          addMarkers(map, allNodes[nodeType], nodeType, setSelectedObject);
        }
      });

      // Draw visible line types
      ENABLED_LINE_TYPES.forEach((lineType) => {
        if (lineVisibility[lineType] && allLines[lineType].length > 0) {
          drawLines(allLines[lineType], lineType, map, setSelectedObject);
        }
      });

      // Draw visible areas
      ENABLED_AREA_TYPES.forEach((areaType) => {
        if (areaVisibility[areaType] && allAreas[areaType].length > 0) {
          drawAreas(allAreas[areaType], areaType, map, setSelectedObject);
        }
      });

      setGameState('playing');
    } catch (error) {
      console.error('Failed to load game elements:', error);
      setGameState('idle');
    }
  }, [coordinates, radius, lineVisibility, nodeVisibility, areaVisibility]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setSelectedObject(null);

    // Remove all line types from map
    ENABLED_LINE_TYPES.forEach(lineType => {
      removeLines(lineType, map);
    });

    // Remove all node types from map
    ENABLED_NODE_TYPES.forEach(nodeType => {
      removeMarkers(nodeType, map, nodeData);
    });

    // Remove all area types from map
    ENABLED_AREA_TYPES.forEach(areaType => {
      removeAreas(areaType, map);
    });

    // Remove ALL markers at once
    removeAllMarkers();

    // Clear node, line, and area data
    setNodeData(ENABLED_NODE_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<NodeType, GenericNode[]>));
    setLineData(ENABLED_LINE_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<LineType, GenericLine[]>));
    setAreaData(ENABLED_AREA_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<AreaType, GenericArea[]>));
    
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
    selectedObject,
    setSelectedObject,
    // Generic line state
    lineVisibility,
    lineData,
    enabledLineTypes: ENABLED_LINE_TYPES,
    // Generic node state
    nodeVisibility,
    nodeData,
    enabledNodeTypes: ENABLED_NODE_TYPES,
    // Generic area state
    areaVisibility,
    areaData,
    enabledAreaTypes: ENABLED_AREA_TYPES,
    // Handlers
    handleMapLoad,
    handleMarkerDragEnd,
    startGame,
    resetGame,
    handleToggleLineType,
    handleToggleNodeType,
    handleToggleAreaType,
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