import mapboxgl from 'mapbox-gl';
import React from 'react';

// Define a generic interface for line features
export interface GenericLineFeature extends GeoJSON.Feature {
  properties: Record<string, any>;
}

// Configuration for different line types
export const LINE_STYLES = {
  railway: {
    layerId: 'train-lines-layer',
    sourceId: 'train-lines',
    colors: {
      'rail': '#2563eb',
      'light_rail': '#16a34a',
      'subway': '#dc2626',
      'tram': '#ea580c',
      'default': '#6b7280'
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
      'line': '#dc2626',
      'cable': '#dc2626',
      'minor_line': '#dc2626',
      'default': '#dc2626'
    },
    widths: {
      'line': 4,
      'cable': 2,
      'minor_line': 2,
      'default': 2
    },
    tagKey: 'power'
  }
  // Add more line types here as needed
} as const;

export type LineTypeKey = keyof typeof LINE_STYLES;

/**
 * Draw any type of infrastructure lines on the map
 */
export function drawLines(
  features: GenericLineFeature[],
  lineType: LineTypeKey,
  map: React.MutableRefObject<mapboxgl.Map | null>,
  setSelectedLine: React.Dispatch<React.SetStateAction<GenericLineFeature | null>>
) {
  if (!map.current) return;

  const config = LINE_STYLES[lineType];

  // Create GeoJSON FeatureCollection
  const geojsonData = {
    type: 'FeatureCollection' as const,
    features
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
      setSelectedLine(e.features[0] as GenericLineFeature);
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

/**
 * Remove any type of infrastructure lines from the map
 */
export function removeLines(
  lineType: LineTypeKey,
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

