"use client";

// Components
import MapContainer from "@/components/map/mapContainer";
import GameControls from "@/components/game/gameControls";
import DrawingControls from "@/components/drawing/drawingControls";
import InfoPanels from "@/components/info/infoPanels";
import FilterMenu from "@/components/map/filterMenu";
import LineDetailsDialog from "@/components/map/LineDetailsDialog";
import AreaTypeDialog from "@/components/dialogs/areaTypeDialog";
import { getWindDirectionText } from "@/lib/weatherApi";

// Hooks
import { useMapLogic } from "@/hooks/useMapLogic";
import { usePolygonDrawing } from "@/hooks/usePolygonDrawing";

import "mapbox-gl/dist/mapbox-gl.css";

export default function Home() {
  const {
    coordinates,
    locationInfo,
    radius,
    setRadius,
    appState,
    weatherData,
    weatherLoading,
    selectedLine,
    setSelectedLine,
    lineVisibility,
    enabledLineTypes,
    handleMapLoad,
    handleMarkerDragEnd,
    startGame,
    resetGame,
    handleToggleLineType,
    getSelectedLineType,
    map,
    marker,
  } = useMapLogic();

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
  } = usePolygonDrawing(map);

  // Combine both resets
  const handleResetGame = () => {
    resetGame();
    clearAllPolygons();
    setIsDrawingMode(false);
  };

  return (
    <div className="w-full h-screen relative">
      <MapContainer
        onMapLoad={handleMapLoad}
        onMarkerDragEnd={handleMarkerDragEnd}
        appState={appState}
        coordinates={coordinates}
        radius={radius}
        markerRef={marker}
      />

      {/* Filter Menu */}
      {appState === "playing" && (
        <div className="absolute top-4 left-4 z-10">
          <FilterMenu
            lineVisibility={lineVisibility}
            enabledLineTypes={enabledLineTypes}
            onToggleLineType={handleToggleLineType}
          />
        </div>
      )}

      {/* Top-right controls container */}
      <div className="absolute top-4 right-4 flex flex-col gap-4 z-10">
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

      {/* Detail Popups */}
      {selectedLine && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <LineDetailsDialog
            line={selectedLine}
            type={getSelectedLineType(selectedLine)}
            onClose={() => setSelectedLine(null)}
          />
        </div>
      )}

      <AreaTypeDialog
        showAreaTypeDialog={showAreaTypeDialog}
        setShowAreaTypeDialog={() => {}}
        pendingPolygon={pendingPolygon}
        handleAreaTypeSelect={handleAreaTypeSelect}
      />
    </div>
  );
}
