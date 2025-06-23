'use client';

import { useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { addCompletedPolygon, updatePolygonPreview, clearAllPolygons, clearPolygonPreview } from "@/lib/shapes/polygon";
import { useTranslations } from 'next-intl';

export function usePolygonDrawing(map: React.MutableRefObject<mapboxgl.Map | null>) {
  const t = useTranslations();
  
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([]);
  const [drawnPolygons, setDrawnPolygons] = useState<[number, number][][]>([]);
  const [showAreaTypeDialog, setShowAreaTypeDialog] = useState(false);
  const [pendingPolygon, setPendingPolygon] = useState<{points: [number, number][]; index: number;} | null>(null);
  const [polygonTypes, setPolygonTypes] = useState<{ [key: number]: string }>({});

  // Toggle drawing mode
  const toggleDrawingMode = useCallback(() => {
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
  }, [map]);

  // Handle area type selection
  const handleAreaTypeSelect = useCallback((areaType: string) => {
    if (!pendingPolygon) return;

    // Store the polygon type
    setPolygonTypes(prev => ({
      ...prev,
      [pendingPolygon.index]: areaType
    }));

    console.log(`Selected area type: ${areaType} for polygon index: ${pendingPolygon.index}`);

    // Add polygon to state and map
    setDrawnPolygons(prev => [...prev, pendingPolygon.points]);
    addCompletedPolygon(pendingPolygon.points, pendingPolygon.index, areaType, map, t);

    // Close dialog and reset pending polygon
    setShowAreaTypeDialog(false);
    setPendingPolygon(null);
  }, [pendingPolygon, map, t]);

  // Clear all polygons
  const clearAllPolygonsHandler = useCallback(() => {
    clearAllPolygons(map, drawnPolygons, setDrawnPolygons, setCurrentPolygon, setPolygonTypes);
  }, [map, drawnPolygons]);

  // Handle drawing mode cursor and zoom behavior
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

  // Handle map click events for polygon drawing
  useEffect(() => {
    if (!map.current) return;

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

    const handleMapDoubleClick = () => {
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

    const handleMouseMove = () => {
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
  }, [isDrawingMode, currentPolygon, drawnPolygons.length, map]);

  return {
    isDrawingMode,
    setIsDrawingMode,
    currentPolygon,
    drawnPolygons,
    showAreaTypeDialog,
    pendingPolygon,
    polygonTypes,
    toggleDrawingMode,
    handleAreaTypeSelect,
    clearAllPolygons: clearAllPolygonsHandler,
    setShowAreaTypeDialog
  };
}