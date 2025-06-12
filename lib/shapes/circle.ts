// Circle functions remain the same
function createCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const [lng, lat] = center;
  const coords = [];
  const distanceX = radiusInMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  const distanceY = radiusInMeters / 110540;

  for (let i = 0; i < points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const dx = Math.cos(angle) * distanceX;
    const dy = Math.sin(angle) * distanceY;
    coords.push([lng + dx, lat + dy]);
  }

  coords.push(coords[0]); // close polygon

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords]
    },
    properties: {}
  };
}

export const updateCircle = (
  center: [number, number], 
  radiusInMeters: number, 
  map: React.MutableRefObject<mapboxgl.Map | null>, 
  lastCircleParams: React.MutableRefObject<{ center: [number, number]; radius: number } | null>
) => {
  if (!map.current) return;

  const circleData = createCircle(center, radiusInMeters);
  lastCircleParams.current = { center, radius: radiusInMeters };

  if (map.current.getSource('circle-source')) {
    (map.current.getSource('circle-source') as mapboxgl.GeoJSONSource).setData(circleData);
  } else {
    map.current.addSource('circle-source', {
      type: 'geojson',
      data: circleData
    });

    map.current.addLayer({
      id: 'circle-layer',
      type: 'fill',
      source: 'circle-source',
      paint: {
        'fill-color': '#ff0000',
        'fill-opacity': 0.05
      }
    });

    map.current.addLayer({
      id: 'circle-outline',
      type: 'line',
      source: 'circle-source',
      paint: {
        'line-color': '#ff0000',
        'line-width': 2,
        'line-opacity': 0.8
      }
    });
  }
};