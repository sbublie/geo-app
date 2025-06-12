'use client';

// libraries
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import {useTranslations} from 'next-intl';

// components
import { mapbox_style } from "@/components/mapbox_style";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { getLocationInfo } from "@/lib/places";
import { Button } from "@/components/ui/button";
import { updateCircle } from "@/lib/shapes/circle";
import { LoadingSpinner } from "@/components/ui/spinner";
import { TrainLineDetails, PowerLineDetails } from "@/components/map/details";
import AreaTypeDialog from "@/components/dialogs/areaTypeDialog";
import { addCompletedPolygon, updatePolygonPreview, clearAllPolygons, clearPolygonPreview } from "@/lib/shapes/polygon";
import WindArrow from '@/components/ui/wind';

// functions
import { drawTrainLines, drawPowerLines, removeInfrastructureLines } from "@/lib/shapes/lines";

// API
import fetchWeatherData from "@/lib/weatherApi";
import { getTrainLinesInArea, createBoundingBoxFromCenter, TrainLine, getPowerLinesInArea, PowerLine } from "@/lib/osmApi";

// Types
import WeatherData from '@/types/weatherData';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Home() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const lastCircleParams = useRef<{ center: [number, number]; radius: number } | null>(null);
  const t = useTranslations();

  // State variables
  const [coordinates, setCoordinates] = useState<{ lng: number; lat: number }>({ lng: 9, lat: 48 });
  const [locationInfo, setLocationInfo] = useState<{ street: string; city: string }>({ street: '', city: '' });
  const [radius, setRadius] = useState<number>(2000); // radius in meters
  const [mapLoaded, setMapLoaded] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [selectedTrainLine, setSelectedTrainLine] = useState<TrainLine | null>(null);
  const [selectedPowerLine, setSelectedPowerLine] = useState<PowerLine | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([]);
  const [drawnPolygons, setDrawnPolygons] = useState<[number, number][][]>([]);
  const [showAreaTypeDialog, setShowAreaTypeDialog] = useState(false);
  const [pendingPolygon, setPendingPolygon] = useState<{points: [number, number][];index: number;} | null>(null);
  const [polygonTypes, setPolygonTypes] = useState<{ [key: number]: string }>({});
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const getWindDirectionText = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  async function triggerMapElements() {
    try {
      const boundingBox = createBoundingBoxFromCenter(coordinates.lat, coordinates.lng, radius / 1000);
      const trainLines = await getTrainLinesInArea(boundingBox);
      const powerLines = await getPowerLinesInArea(boundingBox);


      // Draw the train lines on the map
      drawTrainLines(trainLines, map, setSelectedTrainLine);
      drawPowerLines(powerLines, map, setSelectedPowerLine);

      // Set Catastrophe state to playing after loading
      setGameState('playing');
    } catch (error) {
      console.error('Failed to get train lines:', error);
      setGameState('idle'); // Reset to idle on error
    }
  }

  function startGame() {
    // Implement your Catastrophe start logic here
    setGameState('loading');
    triggerMapElements();
  }

  // Add function to handle area type selection
  const handleAreaTypeSelect = (areaType: string) => {
    if (!pendingPolygon) return;

    // Store the polygon type
    setPolygonTypes(prev => ({
      ...prev,
      [pendingPolygon.index]: areaType
    }));

    // Add polygon to state and map
    setDrawnPolygons(prev => [...prev, pendingPolygon.points]);
    addCompletedPolygon(pendingPolygon.points, pendingPolygon.index, areaType, map, t);

    // Close dialog and reset pending polygon
    setShowAreaTypeDialog(false);
    setPendingPolygon(null);
  };

  // Function to clear all polygons
  function triggerClearAllPolygons() {
    clearAllPolygons(map, drawnPolygons, setDrawnPolygons, setCurrentPolygon, setPolygonTypes);
  }

  // Function to toggle drawing mode
  const toggleDrawingMode = () => {
    setIsDrawingMode(prev => {
      const newMode = !prev;
      if (!newMode) {
        // Exiting drawing mode - clear current polygon
        setCurrentPolygon([]);
        clearPolygonPreview(map);

        // Reset cursor to default
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      } else {
        // Entering drawing mode - set crosshair cursor
        if (map.current) {
          map.current.getCanvas().style.cursor = 'crosshair';
        }
      }
      return newMode;
    });
  };

  useEffect(() => {
    if (!map.current) return;

    if (isDrawingMode) {
      // Disable double-click zoom when in drawing mode
      map.current.doubleClickZoom.disable();

      // Change cursor to crosshair for drawing mode
      map.current.getCanvas().style.cursor = 'crosshair';

    } else {
      map.current?.doubleClickZoom.enable();

      // Reset cursor to default
      map.current.getCanvas().style.cursor = '';
    }
  }, [isDrawingMode]);

  // Initialize map only once
  useEffect(() => {
    if (map.current) return; // initialize map only once

    // You'll need to set your Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapbox_style, // your custom style
        center: [9, 48], // starting position [lng, lat]
        zoom: 13 // starting zoom
      });

      map.current.on('load', () => {
        // Add draggable marker
        marker.current = new mapboxgl.Marker({
          draggable: true,
          color: '#ff0000'
        })
          .setLngLat([9, 48])
          .addTo(map.current!);

        // Initial reverse geocoding and circle

        getLocationInfo(9, 48).then((locationInfo) => {
          setLocationInfo({ street: locationInfo.street, city: locationInfo.city });
        });

        updateCircle([9, 48], radius, map, lastCircleParams);
        fetchWeatherData(9, 48, setWeatherData, setWeatherLoading);

        setMapLoaded(true); // Signal that map is ready
      });
    }
  }, []); // Keep empty dependency array for map initialization

  useEffect(() => {
    if (!marker.current) return;

    const isDraggable = gameState !== 'playing';
    marker.current.setDraggable(isDraggable);
    marker.current.setLngLat([coordinates.lng, coordinates.lat]);

    // Update marker color dynamically
    const markerElement = marker.current.getElement();
    const svgElement = markerElement.querySelector('svg');
    if (svgElement) {
      const path = svgElement.querySelector('path');
      if (path) {
        path.setAttribute('fill', isDraggable ? '#ff0000' : '#666666');
      }
    }
  }, [gameState, coordinates]);

  useEffect(() => {
    if (!mapLoaded || !marker.current) return;

    const handleDragEnd = () => {
      const lngLat = marker.current!.getLngLat();
      const roundedCoords = {
        lng: Math.round(lngLat.lng * 100000) / 100000,
        lat: Math.round(lngLat.lat * 100000) / 100000
      };
      setCoordinates(roundedCoords);
      getLocationInfo(lngLat.lng, lngLat.lat).then(setLocationInfo);
      updateCircle([lngLat.lng, lngLat.lat], radius, map, lastCircleParams);

      fetchWeatherData(roundedCoords.lat, roundedCoords.lng, setWeatherData, setWeatherLoading);
    };

    marker.current.on('dragend', handleDragEnd);

    return () => {
      marker.current?.off('dragend', handleDragEnd);
    };
  }, [mapLoaded, radius]);

  // Update circle when radius changes
  useEffect(() => {
    if (marker.current) {
      const lngLat = marker.current.getLngLat();
      updateCircle([lngLat.lng, lngLat.lat], radius, map, lastCircleParams);
    }
  }, [radius]);

  // Add this useEffect to handle gameState changes
  useEffect(() => {
    if (!marker.current) return;


    const isDraggable = gameState !== 'playing';
    marker.current.setDraggable(isDraggable);

    // Optional: update marker color
    const markerEl = marker.current.getElement();
    const path = markerEl?.querySelector('svg path');
    if (path) {
      path.setAttribute('fill', isDraggable ? '#ff0000' : '#666666');
    }
  }, [gameState, coordinates]);

  // Add this function after your startGame function
  function resetGame() {
    // Reset all Catastrophe states
    setGameState('idle');
    setSelectedTrainLine(null);
    setSelectedPowerLine(null);
    removeInfrastructureLines('power', map);
    removeInfrastructureLines('railway', map);

    // Clear polygons and exit drawing mode
    clearAllPolygons(map, drawnPolygons, setDrawnPolygons, setCurrentPolygon, setPolygonTypes);
    setIsDrawingMode(false);
  }

  // Update your map initialization useEffect to add event listeners
  useEffect(() => {
    if (map.current) return; // initialize map only once

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapbox_style,
        center: [9, 48],
        zoom: 13
      });

      map.current.on('load', () => {
        // Add draggable marker
        marker.current = new mapboxgl.Marker({
          draggable: true,
          color: '#ff0000'
        })
          .setLngLat([9, 48])
          .addTo(map.current!);

        // Initial reverse geocoding and circle
        getLocationInfo(9, 48).then((locationInfo) => {
          setLocationInfo({ street: locationInfo.street, city: locationInfo.city });
        });

        updateCircle([9, 48], radius, map, lastCircleParams);

        setMapLoaded(true);
      });
    }
  }, []); // Keep empty dependency array

  // Add a separate useEffect to handle polygon drawing event listeners
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawingMode) return;

      const { lng, lat } = e.lngLat;
      const newPoint: [number, number] = [lng, lat];

      setCurrentPolygon(prev => {
        const updated = [...prev, newPoint];
        updatePolygonPreview(updated, map);
        return updated;
      });
    };

    const handleMapDoubleClick = (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawingMode || currentPolygon.length < 2) return;

      // Complete the polygon and show type selection
      const completedPolygon = [...currentPolygon];
      setCurrentPolygon([]);
      clearPolygonPreview(map);

      // Show dialog for area type selection
      setPendingPolygon({
        points: completedPolygon,
        index: drawnPolygons.length
      });
      setShowAreaTypeDialog(true);
    };

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawingMode) return;

      // Change cursor to crosshair when moving over the map in drawing mode
      map.current!.getCanvas().style.cursor = 'crosshair';
    };

    const handleMouseLeave = () => {
      if (!isDrawingMode) return;

      // Keep crosshair cursor even when leaving the map in drawing mode
      map.current!.getCanvas().style.cursor = 'crosshair';
    };

    // Remove existing listeners
    map.current.off('click', handleMapClick);
    map.current.off('dblclick', handleMapDoubleClick);
    map.current.off('mousemove', handleMouseMove);
    map.current.off('mouseleave', handleMouseLeave);

    // Add new listeners
    map.current.on('click', handleMapClick);
    map.current.on('dblclick', handleMapDoubleClick);
    map.current.on('mousemove', handleMouseMove);
    map.current.on('mouseleave', handleMouseLeave);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.off('dblclick', handleMapDoubleClick);
        map.current.off('mousemove', handleMouseMove);
        map.current.off('mouseleave', handleMouseLeave);
      }
    };
  }, [mapLoaded, isDrawingMode, currentPolygon, drawnPolygons.length]); // Add all dependencies

  // Update your return statement to add polygon drawing controls
  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top-right stack container */}
      {gameState === 'idle' && (
        <div className="absolute top-4 right-4 flex flex-col gap-4 z-10">
          <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border min-w-[200px]">
            <div className="text-lg font-semibold text-gray-700 mb-2">{t('app.title')}</div>
            <div className="text-sm text-gray-600">
              {t('app.description')}
            </div>
            <div className="flex items-center justify-center mt-3">
              <Button className="mt-2 bg-green-500 text-white w-full" onClick={startGame}>{t('game.start')}</Button>
            </div>
          </div>

          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg border min-w-[250px]">
            <div className="space-y-3">
              <Label htmlFor="radius-slider" className="text-sm font-semibold text-gray-700">
                {t('common.radius')}: {radius}m
              </Label>
              <Slider
                id="radius-slider"
                min={100}
                max={5000}
                step={50}
                value={[radius]}
                onValueChange={(value) => setRadius(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>100m</span>
                <span>5000m</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {gameState === 'loading' && (
        <div className="absolute top-4 right-4 z-10 flex flex-col items-center justify-center bg-white bg-opacity-90 p-4 rounded-lg shadow-lg border min-w-[370px]">
          <div className="text-xl font-semibold text-gray-700 mb-2">{t('game.loading')}</div>
          <LoadingSpinner size={35} />
        </div>
      )}


      {/* Add this new section for the playing state */}
      {gameState === 'playing' && (
        <div className="absolute top-4 right-4 flex flex-col gap-4 z-10">
          <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border min-w-[200px]">
            <div className="text-lg font-semibold text-gray-700 mb-2">{t('game.active')}</div>
            <div className="text-sm text-gray-600 mb-3">
              {t('game.instructions')}
            </div>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white w-full"
              onClick={resetGame}
            >
              {t('game.reset')}
            </Button>
          </div>
          {/* Add polygon drawing controls */}
          <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border min-w-[200px]">
            <div className="text-sm font-semibold text-gray-700 mb-2">{t('drawing.title')}</div>
            <div className="text-xs text-gray-600 mb-3">
              {isDrawingMode ? t('drawing.instructions') : t('drawing.instructionsIdle')}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className={`text-white w-full ${isDrawingMode ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                onClick={toggleDrawingMode}
              >
                {isDrawingMode ? t('drawing.stopDrawing') : t('drawing.startDrawing')}
              </Button>
              {drawnPolygons.length > 0 && (
                <Button
                  className="bg-gray-500 hover:bg-gray-600 text-white w-full text-xs"
                  onClick={triggerClearAllPolygons}
                >
                  {t('drawing.clearAll')} ({drawnPolygons.length})
                </Button>
              )}
            </div>
            {currentPolygon.length > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                {t('drawing.currentPoints', { count: currentPolygon.length })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-14 right-4 flex flex-col gap-4 z-10">

        {/* Weather info display */}
        <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg border min-w-[370px]">
          <div className="text-sm font-semibold text-gray-700 mb-3">{t('weather.title')}</div>
          {weatherLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size={24} />
              <span className="ml-2 text-sm text-gray-600">{t('weather.loading')}</span>
            </div>
          ) : weatherData ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Left side - Main weather info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{weatherData.temperature}°C</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>{t('weather.humidity')}:</strong> {weatherData.humidity}%</div>
                  <div><strong>{t('weather.pressure')}:</strong> {weatherData.pressure} hPa</div>
                </div>
              </div>

              {/* Right side - Wind info */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700 text-center">{t('weather.wind')}</div>
                <WindArrow direction={weatherData.windDirection} />
                <div className="text-xs text-gray-600 text-center space-y-1">
                  <div><strong>{getWindDirectionText(weatherData.windDirection)}</strong></div>
                  <div>{weatherData.windSpeed} m/s</div>
                  <div>({Math.round(weatherData.windSpeed * 3.6)} km/h)</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-4 text-center">
              {t('weather.unavailable')}
            </div>
          )}
        </div>

        {/* Location info display */}
        <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border min-w-[370px]">
          <div className="text-sm font-semibold text-gray-700 mb-2">{t('location.title')}</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>{t('location.street')}:</strong> {locationInfo.street}</div>
            <div><strong>{t('location.city')}:</strong> {locationInfo.city}</div>
            <div className="border-t pt-1 mt-2">
              <div>{t('location.lat')} {coordinates.lat}</div>
              <div>{t('location.lng')} {coordinates.lng}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Train Line Details Popup */}
      {selectedTrainLine && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <TrainLineDetails
            trainLine={selectedTrainLine}
            onClose={() => setSelectedTrainLine(null)}
          />
        </div>
      )}

      {/* Power Line Details Popup*/}
      {selectedPowerLine && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <PowerLineDetails
            powerLine={selectedPowerLine}
            onClose={() => setSelectedPowerLine(null)}
          />
        </div>
      )}

      <AreaTypeDialog
        showAreaTypeDialog={showAreaTypeDialog}
        setShowAreaTypeDialog={setShowAreaTypeDialog}
        pendingPolygon={pendingPolygon}
        handleAreaTypeSelect={handleAreaTypeSelect}
      />

    </div>);
}