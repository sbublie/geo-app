import mapboxgl from "mapbox-gl";
import GenericNode from "@/types/GenericNode";
import { NodeType } from "@/types/NodeConfig";
import { createRoot } from "react-dom/client";
import { nodeConfig } from "@/lib/config/nodeConfig";
import React from "react";
import { SelectedLineWithPoint } from "./lines";

// Store marker references globally so we can remove them later
const markerStore: Map<string, mapboxgl.Marker> = new Map();

// Define a type for the selected object with pixel position
export interface SelectedNodeWithPoint {
  feature: GenericNode;
  point: { x: number; y: number };
}

export function addMarkers(
  map: React.MutableRefObject<mapboxgl.Map | null>,
  nodes: GenericNode[],
  nodeType: NodeType,
  setSelectedObject: React.Dispatch<React.SetStateAction<SelectedNodeWithPoint | SelectedLineWithPoint | null>>
) {
  if (!map.current || !nodes || nodes.length === 0) return;

  const config = nodeConfig[nodeType];

  nodes.forEach((node) => {
    // Create container for React component
    const markerElement = document.createElement("div");
    markerElement.style.cssText = `
      width: 24px;
      height: 24px;
      background-color: ${config.colors.default || "#16a34a"};
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    `;

    // Render React icon
    const root = createRoot(markerElement);
    const IconComponent = config.icon;
    root.render(
      React.createElement(IconComponent, { size: 16, color: "white" })
    );

    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat(node.geometry.coordinates)
      .addTo(map.current!);

    const markerId = `marker-${nodeType}-${node.id}`;

    // Add click event listener to the marker element (not the map layer)
    markerElement.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      // Get pixel position for dialog placement
      const point = map.current!.project(node.geometry.coordinates as [number, number]);
      setSelectedObject({
        feature: node,
        point: { x: point.x, y: point.y }
      });
    });

    // Store the marker reference for later removal
    markerStore.set(markerId, marker);
  });
}

export function removeMarkers(
  nodeType: NodeType,
  map: React.MutableRefObject<mapboxgl.Map | null>,
  allNodes?: Record<NodeType, GenericNode[]>
) {
  if (!map.current) return;

  // Guard against undefined allNodes
  if (!allNodes || !allNodes[nodeType]) {
    console.warn(`No nodes found for type: ${nodeType}`);
    return;
  }

  // Remove markers for the specific node type
  allNodes[nodeType].forEach((node) => {
    const markerId = `marker-${nodeType}-${node.id}`;
    const marker = markerStore.get(markerId);
    if (marker) {
      marker.remove(); // Use Mapbox's remove method
      markerStore.delete(markerId); // Clean up the reference
    }
  });
}

// Optional: function to remove ALL markers
export function removeAllMarkers() {
  markerStore.forEach((marker) => {
    marker.remove();
  });
  markerStore.clear();
}
