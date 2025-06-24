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
    selectedObject,
    setSelectedObject,
    lineVisibility,
    enabledLineTypes,
    nodeVisibility,
    enabledNodeTypes,
    handleMapLoad,
    handleMarkerDragEnd,
    startGame,
    resetGame,
    handleToggleLineType,
    handleToggleNodeType,
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
            nodeVisibility={nodeVisibility}
            enabledNodeTypes={enabledNodeTypes}
            onToggleNodeType={handleToggleNodeType}
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
      {selectedObject && (
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
