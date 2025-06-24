import mapboxgl from "mapbox-gl";
import React from "react";
import { lineConfig } from "@/lib/config/lineConfig";
import { SelectedNodeWithPoint } from "./marker";

// Define a generic interface for line features
export interface GenericLineFeature extends GeoJSON.Feature {
  properties: Record<string, any>;
}

export type LineTypeKey = keyof typeof lineConfig;

// Add a type for the selected object with pixel position
export interface SelectedLineWithPoint {
  feature: GenericLineFeature;
  point: { x: number; y: number };
}

/**
 * Draw any type of infrastructure lines on the map
 */
export function drawLines(
  features: GenericLineFeature[],
  lineType: LineTypeKey,
  map: React.MutableRefObject<mapboxgl.Map | null>,
  setSelectedObject: React.Dispatch<
    React.SetStateAction<SelectedLineWithPoint | SelectedNodeWithPoint | null>
  >
) {
  if (!map.current) return;

  const config = lineConfig[lineType];
  const sourceId = `${lineType}-lines`;
  const layerId = `${lineType}-lines-layer`;

  // Create GeoJSON FeatureCollection
  const geojsonData = {
    type: "FeatureCollection" as const,
    features,
  };

  // Remove existing lines if they exist
  if (map.current.getSource(sourceId)) {
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    map.current.removeSource(sourceId);
  }

  // Add lines source
  map.current.addSource(sourceId, {
    type: "geojson",
    data: geojsonData,
  });

  // Build color expression
  const colorExpression: mapboxgl.Expression = ["case"] as mapboxgl.Expression;
  Object.entries(config.colors).forEach(([key, color]) => {
    if (key !== "default") {
      (colorExpression as any[]).push(
        ["==", ["get", config.tagKey], key],
        color
      );
    }
  });
  (colorExpression as any[]).push(config.colors.default);

  // Build width expression
  const widthExpression: mapboxgl.Expression = ["case"] as mapboxgl.Expression;
  Object.entries(config.widths).forEach(([key, width]) => {
    if (key !== "default") {
      (widthExpression as any[]).push(
        ["==", ["get", config.tagKey], key],
        width
      );
    }
  });
  (widthExpression as any[]).push(config.widths.default);

  // Add lines layer
  map.current.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": colorExpression,
      "line-width": widthExpression,
      "line-opacity": 0.8,
    },
  });

  // Add click event listener
  map.current.on("click", layerId, (e) => {
    if (e.features && e.features[0]) {
      const feature = e.features[0] as GenericLineFeature;
      const point = map.current!.project(e.lngLat);
      setSelectedObject({
        feature,
        point: { x: point.x, y: point.y },
      });
    }
  });

  // Change cursor to pointer when hovering
  map.current.on("mouseenter", layerId, () => {
    if (map.current) {
      map.current.getCanvas().style.cursor = "pointer";
    }
  });

  map.current.on("mouseleave", layerId, () => {
    if (map.current) {
      map.current.getCanvas().style.cursor = "";
    }
  });
}

/**
 * Remove any type of infrastructure lines from the map
 */
export function removeLines(
  lineType: LineTypeKey,
  map: React.MutableRefObject<mapboxgl.Map | null>
) {
  if (!map.current) return;

  const sourceId = `${lineType}-lines`;
  const layerId = `${lineType}-lines-layer`;

  if (map.current.getLayer(layerId)) {
    map.current.removeLayer(layerId);
  }
  if (map.current.getSource(sourceId)) {
    map.current.removeSource(sourceId);
  }
}
