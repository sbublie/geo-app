"use client";

// Components
import MapContainer from "@/components/map/MapContainer";
import GameControls from "@/components/game/GameControls";
import DrawingControls from "@/components/drawing/DrawingControls";
import InfoPanels from "@/components/info/InfoPanels";
import FilterMenu from "@/components/map/FilterMenu";
import LineDetailsDialog from "@/components/dialogs/DetailsDialog";
import DrawAreaTypeDialog from "@/components/dialogs/DrawAreaTypeDialog";
import { getWindDirectionText } from "@/lib/api/weatherApi";
import MapStyleSwitcher from "@/components/map/MapStyleSwitcher";

// Hooks
import { useMapLogic } from "@/hooks/useMapLogic";
import { usePolygonDrawing } from "@/hooks/usePolygonDrawing";
import { useEffect, useRef, useCallback } from "react";
import { addCompletedPolygon } from "@/lib/shapes/drawArea";

import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslations } from "next-intl";

export default function Home() {
  // First get polygon drawing hook
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const {
    isDrawingMode,
    currentPolygon,
    drawnPolygons,
    showAreaTypeDialog,
    pendingPolygon,
    toggleDrawingMode,
    handleAreaTypeSelect,
    clearAllPolygons,
    setIsDrawingMode,
    polygonTypes,
  } = usePolygonDrawing(mapRef);

  // Then pass isDrawingMode to useMapLogic
  const {
    coordinates,
    locationInfo,
    radius,
    setRadius,
    appState,
    weatherData,
    weatherLoading,
    selectedObject,
    setSelectedObject,
    lineVisibility,
    enabledLineTypes,
    nodeVisibility,
    enabledNodeTypes,
    areaVisibility,
    enabledAreaTypes,
    handleMapLoad,
    handleMarkerDragEnd,
    startGame,
    resetGame,
    handleToggleLineType,
    handleToggleNodeType,
    handleToggleAreaType,
    map,
    marker,
    mapStyle,
    handleMapStyleChange,
  } = useMapLogic(isDrawingMode); // Pass drawing mode here

  const t = useTranslations();

  // Sync map refs
  useEffect(() => {
    if (map.current) {
      mapRef.current = map.current;
    }
  }, [map.current]);

  // Clear selected object when entering drawing mode
  useEffect(() => {
    if (isDrawingMode && selectedObject) {
      setSelectedObject(null);
    }
  }, [isDrawingMode, selectedObject, setSelectedObject]);

  // Combine both resets
  const handleResetGame = useCallback(() => {
    resetGame(); // Reset game logic
    clearAllPolygons(); // Clear polygons
    setIsDrawingMode(false); // Exit drawing mode
  }, [resetGame, clearAllPolygons, setIsDrawingMode]);

  // Redraw drawn polygons after map style changes with correct types
  useEffect(() => {
    if (!mapRef.current || drawnPolygons.length === 0) return;
    
    // Add a small delay to ensure the map style has fully loaded
    const timeoutId = setTimeout(() => {
      drawnPolygons.forEach((polygon, index) => {
        const areaType = polygonTypes[index] || 'rescue'; // Use stored type or fallback
        addCompletedPolygon(polygon, index, areaType, mapRef, t);
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [mapStyle, drawnPolygons, polygonTypes, t]); // Include all dependencies

  return (
    <div className="w-full h-screen relative">
      <MapContainer
        onMapLoad={handleMapLoad}
        onMarkerDragEnd={handleMarkerDragEnd}
        appState={appState}
        coordinates={coordinates}
        radius={radius}
        markerRef={marker}
        mapStyle={mapStyle}
      />

      {/* Filter Menu */}
      {appState === "playing" && (
        <div className="absolute top-4 left-4 z-10">
          <FilterMenu
            lineVisibility={lineVisibility}
            enabledLineTypes={enabledLineTypes}
            onToggleLineType={handleToggleLineType}
            nodeVisibility={nodeVisibility}
            enabledNodeTypes={enabledNodeTypes}
            onToggleNodeType={handleToggleNodeType}
            areaVisibility={areaVisibility}
            enabledAreaTypes={enabledAreaTypes}
            onToggleAreaType={handleToggleAreaType}
          />
        </div>
      )}

      {/* Top-right controls container */}
      <div className="absolute top-4 right-4 flex flex-col gap-4 z-10">
        {/* Map Style Switcher */}
        <MapStyleSwitcher currentStyle={mapStyle} onChange={handleMapStyleChange} />

        {/* Game Controls */}
        <GameControls
          appState={appState}
          radius={radius}
          setRadius={setRadius}
          onStartGame={startGame}
          onResetGame={handleResetGame}
        />

        {/* Drawing Controls - only show when playing */}
        {appState === "playing" && (
          <DrawingControls
            isDrawingMode={isDrawingMode}
            currentPolygonLength={currentPolygon.length}
            drawnPolygonsCount={drawnPolygons.length}
            onToggleDrawingMode={toggleDrawingMode}
            onClearAllPolygons={clearAllPolygons}
          />
        )}
      </div>

      {/* Info Panels */}
      <InfoPanels
        weatherData={weatherData}
        weatherLoading={weatherLoading}
        locationInfo={locationInfo}
        coordinates={coordinates}
        getWindDirectionText={getWindDirectionText}
      />

      {/* Detail Popups - only show if not in drawing mode */}
      {selectedObject && !isDrawingMode && (
        <div
          style={{
            position: "absolute",
            left: selectedObject.point.x,
            top: selectedObject.point.y,
            zIndex: 20,
            pointerEvents: "auto",
          }}
        >
          <LineDetailsDialog
            selectedObject={selectedObject.feature}
            onClose={() => setSelectedObject(null)}
          />
        </div>
      )}

      <DrawAreaTypeDialog
        showAreaTypeDialog={showAreaTypeDialog}
        setShowAreaTypeDialog={() => {}}
        pendingPolygon={pendingPolygon}
        handleAreaTypeSelect={handleAreaTypeSelect}
      />
    </div>
  );
}
