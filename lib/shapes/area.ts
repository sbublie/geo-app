import mapboxgl from 'mapbox-gl';
import React from 'react';
import { areaConfig } from '@/lib/config/areaConfig';
import GenericArea from '@/types/GenericArea';
import { AreaType } from '@/types/AreaConfig';
import { SelectedLineWithPoint } from './lines';

export type AreaTypeKey = keyof typeof areaConfig;

// Export GenericAreaFeature type for use in other components
export interface GenericAreaFeature {
  type: 'Feature';
  id: number;
  properties: Record<string, any>;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

// Add a type for the selected object with pixel position
export interface SelectedAreaWithPoint {
  feature: GenericAreaFeature;
  point: { x: number; y: number };
}

/**
 * Draw any type of infrastructure areas on the map
 */
export function drawAreas(
  features: GenericAreaFeature[],
  areaType: AreaTypeKey,
  map: React.MutableRefObject<mapboxgl.Map | null>,
  setSelectedObject: React.Dispatch<React.SetStateAction<SelectedAreaWithPoint | SelectedLineWithPoint | null>>
) {
  if (!map.current) return;

  const config = areaConfig[areaType];

  // Create GeoJSON FeatureCollection
  const geojsonData = {
    type: 'FeatureCollection' as const,
    features
  };

  // Remove existing areas if they exist
  if (map.current.getSource(config.sourceId)) {
    if (map.current.getLayer(config.layerId)) {
      map.current.removeLayer(config.layerId);
    }
    if (map.current.getLayer(`${config.layerId}-outline`)) {
      map.current.removeLayer(`${config.layerId}-outline`);
    }
    map.current.removeSource(config.sourceId);
  }

  // Add areas source
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

  // Add fill layer
  map.current.addLayer({
    id: config.layerId,
    type: 'fill',
    source: config.sourceId,
    layout: {},
    paint: {
      'fill-color': colorExpression,
      'fill-opacity': 0.3
    }
  });

  // Add outline layer
  map.current.addLayer({
    id: `${config.layerId}-outline`,
    type: 'line',
    source: config.sourceId,
    layout: {},
    paint: {
      'line-color': colorExpression,
      'line-width': 2,
      'line-opacity': 0.8
    }
  });

  // Define handlers so we can remove them later
  const handleClick = (e: mapboxgl.MapLayerMouseEvent) => {
    if (e.features && e.features[0]) {
      const feature = e.features[0] as GenericAreaFeature;
      const point = map.current!.project(e.lngLat);
      setSelectedObject({
        feature,
        point: { x: point.x, y: point.y }
      });
    }
  };
  const handleMouseEnter = () => {
    if (map.current) {
      map.current.getCanvas().style.cursor = 'pointer';
    }
  };
  const handleMouseLeave = () => {
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
  };

  // Attach handlers
  map.current.on('click', config.layerId, handleClick);
  map.current.on('mouseenter', config.layerId, handleMouseEnter);
  map.current.on('mouseleave', config.layerId, handleMouseLeave);

  // Store handlers on the map instance for later removal
  (map.current as any)[`__areaHandlers_${config.layerId}`] = {
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
  };
}

/**
 * Remove any type of infrastructure areas from the map
 */
export function removeAreas(
  areaType: AreaTypeKey,
  map: React.MutableRefObject<mapboxgl.Map | null>
) {
  if (!map.current) return;

  const config = areaConfig[areaType];

  // Retrieve handlers
  const handlers = (map.current as any)[`__areaHandlers_${config.layerId}`];
  if (handlers) {
    map.current.off('click', config.layerId, handlers.handleClick);
    map.current.off('mouseenter', config.layerId, handlers.handleMouseEnter);
    map.current.off('mouseleave', config.layerId, handlers.handleMouseLeave);
    delete (map.current as any)[`__areaHandlers_${config.layerId}`];
  }

  if (map.current.getLayer(config.layerId)) {
    map.current.removeLayer(config.layerId);
  }
  if (map.current.getLayer(`${config.layerId}-outline`)) {
    map.current.removeLayer(`${config.layerId}-outline`);
  }
  if (map.current.getSource(config.sourceId)) {
    map.current.removeSource(config.sourceId);
  }
}