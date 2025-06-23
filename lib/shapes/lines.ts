import mapboxgl from 'mapbox-gl';
import React from 'react';
import { lineConfig } from '@/lib/config/lineConfig';

// Define a generic interface for line features
export interface GenericLineFeature extends GeoJSON.Feature {
  properties: Record<string, any>;
}

export type LineTypeKey = keyof typeof lineConfig;

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

  const config = lineConfig[lineType];

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

  const config = lineConfig[lineType];

  if (map.current.getLayer(config.layerId)) {
    map.current.removeLayer(config.layerId);
  }
  if (map.current.getSource(config.sourceId)) {
    map.current.removeSource(config.sourceId);
  }
}

