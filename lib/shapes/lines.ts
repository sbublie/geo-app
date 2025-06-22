import { TrainLine, PowerLine, LineType } from "@/lib/osmApi";
import React from 'react';

// Configuration for different line types
const LINE_STYLES = {
  railway: {
    layerId: 'train-lines-layer',
    sourceId: 'train-lines',
    colors: {
      'rail': '#2563eb',           // Blue for main rail
      'light_rail': '#16a34a',     // Green for light rail
      'subway': '#dc2626',         // Red for subway
      'tram': '#ea580c',           // Orange for tram
      'default': '#6b7280'         // Gray for others
    },
    widths: {
      'rail': 3,
      'light_rail': 2,
      'subway': 2,
      'default': 1
    },
    tagKey: 'railway'
  },
  power: {
    layerId: 'power-lines-layer',
    sourceId: 'power-lines',
    colors: {
      'line': '#dc2626',           // Red for transmission lines
      'cable': '#f59e0b',          // Amber for cables
      'minor_line': '#16a34a',     // Green for minor lines
      'default': '#6b7280'         // Gray for others
    },
    widths: {
      'line': 4,                   // Thicker for major transmission
      'cable': 2,
      'minor_line': 1,
      'default': 1
    },
    tagKey: 'power'
  }
} as const;

// Import mapboxgl types
import mapboxgl from 'mapbox-gl';

/**
 * Generic function to draw infrastructure lines on the map
 */
export function drawInfrastructureLines<T extends LineType>(
  lines: T extends 'railway' ? TrainLine[] : PowerLine[],
  lineType: T,
  map: React.MutableRefObject<mapboxgl.Map | null>,
  setSelectedLine: React.Dispatch<React.SetStateAction<(T extends 'railway' ? TrainLine : PowerLine) | null>>
) {
  if (!map.current) return;

  const config = LINE_STYLES[lineType];
  
  // Create GeoJSON FeatureCollection from lines
  const geojsonData = {
    type: 'FeatureCollection' as const,
    features: lines
  };

  // Remove existing lines if they exist
  if (map.current.getSource(config.sourceId)) {
    if (map.current.getLayer(config.layerId)) {
      map.current.removeLayer(config.layerId);
    }
    map.current.removeSource(config.sourceId);
  }

  // Add lines source
  map.current.addSource(config.sourceId, {
    type: 'geojson',
    data: geojsonData
  });

  // Build color expression
  const colorExpression: mapboxgl.Expression = ['case'] as mapboxgl.Expression;
  Object.entries(config.colors).forEach(([key, color]) => {
    if (key !== 'default') {
      (colorExpression as any[]).push(['==', ['get', config.tagKey], key], color);
    }
  });
  (colorExpression as any[]).push(config.colors.default);

  // Build width expression
  const widthExpression: mapboxgl.Expression = ['case'] as mapboxgl.Expression;
  Object.entries(config.widths).forEach(([key, width]) => {
    if (key !== 'default') {
      (widthExpression as any[]).push(['==', ['get', config.tagKey], key], width);
    }
  });
  (widthExpression as any[]).push(config.widths.default);

  // Add lines layer
  map.current.addLayer({
    id: config.layerId,
    type: 'line',
    source: config.sourceId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': colorExpression,
      'line-width': widthExpression,
      'line-opacity': 0.8
    }
  });

  // Add click event listener
  map.current.on('click', config.layerId, (e) => {
    if (e.features && e.features[0]) {
      const feature = e.features[0] as GeoJSON.Feature;
      const line = {
        type: 'Feature' as const,
        id: feature.id,
        properties: feature.properties,
        geometry: feature.geometry
      };
      setSelectedLine(line as T extends 'railway' ? TrainLine : PowerLine);
    }
  });

  // Change cursor to pointer when hovering
  map.current.on('mouseenter', config.layerId, () => {
    if (map.current) {
      map.current.getCanvas().style.cursor = 'pointer';
    }
  });

  map.current.on('mouseleave', config.layerId, () => {
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
  });

}

// Convenience functions for specific line types
export const drawTrainLines = (
  trainLines: TrainLine[], 
  map: React.MutableRefObject<mapboxgl.Map | null>, 
  setSelectedTrainLine: React.Dispatch<React.SetStateAction<TrainLine | null>>
) => {
  drawInfrastructureLines(trainLines, 'railway', map, setSelectedTrainLine);
};

export const drawPowerLines = (
  powerLines: PowerLine[], 
  map: React.MutableRefObject<mapboxgl.Map | null>, 
  setSelectedPowerLine: React.Dispatch<React.SetStateAction<PowerLine | null>>
) => {
  drawInfrastructureLines(powerLines, 'power', map, setSelectedPowerLine);
};

/**
 * Remove infrastructure lines from the map
 */
export function removeInfrastructureLines<T extends LineType>(
  lineType: T,
  map: React.MutableRefObject<mapboxgl.Map | null>
) {
  if (!map.current) return;
  
  const config = LINE_STYLES[lineType];
  
  if (map.current.getLayer(config.layerId)) {
    map.current.removeLayer(config.layerId);
  }
  if (map.current.getSource(config.sourceId)) {
    map.current.removeSource(config.sourceId);
  }
}

// Convenience functions for removing specific line types
export const removeTrainLines = (map: React.MutableRefObject<mapboxgl.Map | null>) => {
  removeInfrastructureLines('railway', map);
};

export const removePowerLines = (map: React.MutableRefObject<mapboxgl.Map | null>) => {
  removeInfrastructureLines('power', map);
};

