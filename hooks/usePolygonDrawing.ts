'use client';

import { useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { addCompletedPolygon, updatePolygonPreview, clearAllPolygons as clearAllPolygonsLib, clearPolygonPreview } from "@/lib/shapes/drawArea";
import { useTranslations } from 'next-intl';

export function usePolygonDrawing(mapRef: React.MutableRefObject<mapboxgl.Map | null>) {
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
        clearPolygonPreview(mapRef);

        // Reset cursor to default
        if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = '';
        }
      } else {
        // Entering drawing mode - set crosshair cursor
        if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = 'crosshair';
        }
      }
      return newMode;
    });
  }, [mapRef]);

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
    addCompletedPolygon(pendingPolygon.points, pendingPolygon.index, areaType, mapRef, t);

    // Close dialog and reset pending polygon
    setShowAreaTypeDialog(false);
    setPendingPolygon(null);
  }, [pendingPolygon, mapRef, t]);

  // Clear all polygons
  const clearAllPolygons = useCallback(() => {
    if (!mapRef.current) return;

    // Remove all completed polygon layers/sources (fill, outline, label, bg)
    for (let i = 0; i < 100; i++) {
      // Polygon fill and outline
      if (mapRef.current.getLayer(`completed-polygon-fill-${i}`)) {
        mapRef.current.removeLayer(`completed-polygon-fill-${i}`);
      }
      if (mapRef.current.getLayer(`completed-polygon-outline-${i}`)) {
        mapRef.current.removeLayer(`completed-polygon-outline-${i}`);
      }
      if (mapRef.current.getSource(`completed-polygon-${i}`)) {
        mapRef.current.removeSource(`completed-polygon-${i}`);
      }

      // Polygon label text and background
      if (mapRef.current.getLayer(`polygon-label-text-${i}`)) {
        mapRef.current.removeLayer(`polygon-label-text-${i}`);
      }
      if (mapRef.current.getLayer(`polygon-label-bg-${i}`)) {
        mapRef.current.removeLayer(`polygon-label-bg-${i}`);
      }
      if (mapRef.current.getSource(`polygon-label-${i}`)) {
        mapRef.current.removeSource(`polygon-label-${i}`);
      }
    }

    // Clear the preview polygon if it exists
    clearPolygonPreview(mapRef);

    // Clear state
    setDrawnPolygons([]);
    setCurrentPolygon([]);
  }, [mapRef]);

  // Handle drawing mode cursor and zoom behavior
  useEffect(() => {
    if (!mapRef.current) return;

    if (isDrawingMode) {
      // Disable double-click zoom when in drawing mode
      mapRef.current.doubleClickZoom.disable();
      // Change cursor to crosshair for drawing mode
      mapRef.current.getCanvas().style.cursor = 'crosshair';
    } else {
      mapRef.current?.doubleClickZoom.enable();
      // Reset cursor to default
      mapRef.current.getCanvas().style.cursor = '';
    }
  }, [isDrawingMode]);

  // Handle map click events for polygon drawing
  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawingMode) return;

      const { lng, lat } = e.lngLat;
      const newPoint: [number, number] = [lng, lat];

      setCurrentPolygon(prev => {
        const updated = [...prev, newPoint];
        updatePolygonPreview(updated, mapRef);
        return updated;
      });
    };

    const handleMapDoubleClick = () => {
      if (!isDrawingMode || currentPolygon.length < 2) return;

      // Complete the polygon and show type selection
      const completedPolygon = [...currentPolygon];
      setCurrentPolygon([]);
      clearPolygonPreview(mapRef);

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
      mapRef.current!.getCanvas().style.cursor = 'crosshair';
    };

    const handleMouseLeave = () => {
      if (!isDrawingMode) return;
      // Keep crosshair cursor even when leaving the map in drawing mode
      mapRef.current!.getCanvas().style.cursor = 'crosshair';
    };

    // Remove existing listeners
    mapRef.current.off('click', handleMapClick);
    mapRef.current.off('dblclick', handleMapDoubleClick);
    mapRef.current.off('mousemove', handleMouseMove);
    mapRef.current.off('mouseleave', handleMouseLeave);

    // Add new listeners
    mapRef.current.on('click', handleMapClick);
    mapRef.current.on('dblclick', handleMapDoubleClick);
    mapRef.current.on('mousemove', handleMouseMove);
    mapRef.current.on('mouseleave', handleMouseLeave);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.off('dblclick', handleMapDoubleClick);
        mapRef.current.off('mousemove', handleMouseMove);
        mapRef.current.off('mouseleave', handleMouseLeave);
      }
    };
  }, [isDrawingMode, currentPolygon, drawnPolygons.length, mapRef]);

  return {
    isDrawingMode,
    currentPolygon,
    drawnPolygons,
    showAreaTypeDialog,
    pendingPolygon,
    toggleDrawingMode,
    handleAreaTypeSelect,
    clearAllPolygons, // Make sure this is included in the return
    setIsDrawingMode,
  };
}