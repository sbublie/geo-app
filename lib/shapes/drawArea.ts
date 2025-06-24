import React from 'react';
import * as turf from '@turf/turf';
import { drawAreaTypes } from '@/lib/config/drawAreaTypes';
import { useTranslations } from 'next-intl';

// Function to update polygon preview
export function updatePolygonPreview(points: [number, number][], map: React.MutableRefObject<mapboxgl.Map | null>) {
    if (!map.current || points.length < 1) return;

    if (points.length === 1) {
        // Show just the first point
        const pointsData = {
            type: 'FeatureCollection' as const,
            features: [{
                type: 'Feature' as const,
                geometry: {
                    type: 'Point' as const,
                    coordinates: points[0]
                },
                properties: { index: 0 }
            }]
        };

        if (map.current.getSource('polygon-preview-points')) {
            (map.current.getSource('polygon-preview-points') as mapboxgl.GeoJSONSource).setData(pointsData);
        } else {
            map.current.addSource('polygon-preview-points', {
                type: 'geojson',
                data: pointsData
            });

            map.current.addLayer({
                id: 'polygon-preview-points',
                type: 'circle',
                source: 'polygon-preview-points',
                paint: {
                    'circle-color': '#ff0000',
                    'circle-radius': 8, // Make it bigger for visibility
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 3
                }
            });
        }
        return;
    }

    // Show line when we have 2 or more points
    const previewData = {
        type: 'Feature' as const,
        geometry: {
            type: 'LineString' as const,
            coordinates: points
        },
        properties: {}
    };

    if (map.current.getSource('polygon-preview')) {
        (map.current.getSource('polygon-preview') as mapboxgl.GeoJSONSource).setData(previewData);
    } else {
        map.current.addSource('polygon-preview', {
            type: 'geojson',
            data: previewData
        });

        map.current.addLayer({
            id: 'polygon-preview-line',
            type: 'line',
            source: 'polygon-preview',
            paint: {
                'line-color': '#ff0000',
                'line-width': 4, // Make it thicker for visibility
                'line-dasharray': [5, 5]
            }
        });
    }

    // Add/update points
    const pointsData = {
        type: 'FeatureCollection' as const,
        features: points.map((point, index) => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: point
            },
            properties: { index }
        }))
    };

    if (map.current.getSource('polygon-preview-points')) {
        (map.current.getSource('polygon-preview-points') as mapboxgl.GeoJSONSource).setData(pointsData);
    } else {
        map.current.addSource('polygon-preview-points', {
            type: 'geojson',
            data: pointsData
        });

        map.current.addLayer({
            id: 'polygon-preview-points',
            type: 'circle',
            source: 'polygon-preview-points',
            paint: {
                'circle-color': '#ff0000',
                'circle-radius': 8, // Make it bigger for visibility
                'circle-stroke-color': '#ffffff',
                'circle-stroke-width': 3
            }
        });
    }
};


// Function to add completed polygon
export function addCompletedPolygon(points: [number, number][], index: number, areaType: string, map: React.MutableRefObject<mapboxgl.Map | null>, t: ReturnType<typeof useTranslations>) {
    if (!map.current || points.length < 3) return;

    // Close the polygon by adding the first point at the end
    const closedPoints = [...points, points[0]];

    const polygonData = {
        type: 'Feature' as const,
        geometry: {
            type: 'Polygon' as const,
            coordinates: [closedPoints]
        },
        properties: { id: index }
    };

    // Calculate area using Turf
    const area = turf.area(polygonData);
    const areaInKm2 = area / 1000000; // Convert from m² to km²
    const centroid = turf.centroid(polygonData);

    // Get area type info
    const typeInfo = drawAreaTypes.find(type => type.value === areaType) || drawAreaTypes.find(type => type.value === 'other')!;

    const sourceId = `completed-polygon-${index}`;

    map.current.addSource(sourceId, {
        type: 'geojson',
        data: polygonData
    });

    // Add fill layer with type-specific color
    map.current.addLayer({
        id: `completed-polygon-fill-${index}`,
        type: 'fill',
        source: sourceId,
        paint: {
            'fill-color': typeInfo.color,
            'fill-opacity': 0.3
        }
    });

    // Add outline layer with type-specific color
    map.current.addLayer({
        id: `completed-polygon-outline-${index}`,
        type: 'line',
        source: sourceId,
        paint: {
            'line-color': typeInfo.color,
            'line-width': 3
        }
    });

    // Add area label at polygon centroid
    const labelSourceId = `polygon-label-${index}`;
    const areaText = areaInKm2 < 0.01
        ? `${Math.round(area)} m²`
        : `${areaInKm2.toFixed(2)} km²`;

    const labelData = {
        type: 'Feature' as const,
        geometry: {
            type: 'Point' as const,
            coordinates: centroid.geometry.coordinates
        },
        properties: {
            area: areaText,
            type: t(`${typeInfo.labelKey}`)
        }
    };

    map.current.addSource(labelSourceId, {
        type: 'geojson',
        data: labelData
    });

    // Add text layer for area label (area + type)
    map.current.addLayer({
        id: `polygon-label-text-${index}`,
        type: 'symbol',
        source: labelSourceId,
        layout: {
            'text-field': [
                'concat',
                ['get', 'area'],
                '\n',
                ['get', 'type']
            ],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-line-height': 1.2
        },
        paint: {
            'text-color': '#000000',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
        }
    });

    // Add background circle for better readability with type-specific color
    map.current.addLayer({
        id: `polygon-label-bg-${index}`,
        type: 'circle',
        source: labelSourceId,
        paint: {
            'circle-color': '#ffffff',
            'circle-opacity': 0.9,
            'circle-radius': 35, // Made bigger to accommodate type text
            'circle-stroke-color': typeInfo.color,
            'circle-stroke-width': 3
        }
    }, `polygon-label-text-${index}`); // Insert below text layer

};

// Function to clear polygon preview
export function clearPolygonPreview(map: React.MutableRefObject<mapboxgl.Map | null>) {
    if (!map.current) return;

    if (map.current.getLayer('polygon-preview-line')) {
        map.current.removeLayer('polygon-preview-line');
    }
    if (map.current.getLayer('polygon-preview-points')) {
        map.current.removeLayer('polygon-preview-points');
    }
    if (map.current.getSource('polygon-preview')) {
        map.current.removeSource('polygon-preview');
    }
    if (map.current.getSource('polygon-preview-points')) {
        map.current.removeSource('polygon-preview-points');
    }
};


// Function to clear all polygons
export function clearAllPolygons(
    map: React.MutableRefObject<mapboxgl.Map | null>,
    drawnPolygons: [number, number][][],
    setDrawnPolygons: React.Dispatch<React.SetStateAction<[number, number][][]>>,
    setCurrentPolygon: React.Dispatch<React.SetStateAction<[number, number][]>>,
    setPolygonTypes: React.Dispatch<React.SetStateAction<Record<number, string>>>
) {

    if (!map.current) return;

    // Clear completed polygons and their labels
    drawnPolygons.forEach((_, index) => {
        const sourceId = `completed-polygon-${index}`;
        const labelSourceId = `polygon-label-${index}`;

        // Remove polygon layers
        if (map.current!.getLayer(`completed-polygon-fill-${index}`)) {
            map.current!.removeLayer(`completed-polygon-fill-${index}`);
        }
        if (map.current!.getLayer(`completed-polygon-outline-${index}`)) {
            map.current!.removeLayer(`completed-polygon-outline-${index}`);
        }
        if (map.current!.getSource(sourceId)) {
            map.current!.removeSource(sourceId);
        }

        // Remove label layers
        if (map.current!.getLayer(`polygon-label-text-${index}`)) {
            map.current!.removeLayer(`polygon-label-text-${index}`);
        }
        if (map.current!.getLayer(`polygon-label-bg-${index}`)) {
            map.current!.removeLayer(`polygon-label-bg-${index}`);
        }
        if (map.current!.getSource(labelSourceId)) {
            map.current!.removeSource(labelSourceId);
        }
    });

    // Clear preview
    clearPolygonPreview(map);

    // Reset state
    setDrawnPolygons([]);
    setCurrentPolygon([]);
    setPolygonTypes({});

};
