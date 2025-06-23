import { LineType } from '@/types/LineConfig'; 
import { lineConfig } from '@/lib/config/lineConfig';
import GenericLine from '@/types/GenericLine'; // Assuming you have a GenericLine type defined
import OverpassResponse from '@/types/OverpassResponse'; // Assuming you have an OverpassResponse type defined
import BoundingBox from '@/types/BoundingBox'; // Assuming you have a BoundingBox type defined

/**
 * Generic function to fetch infrastructure lines in a specified bounding box area using the OSM Overpass API
 */
export async function getInfrastructureLinesInArea<T extends LineType>(
  boundingBox: BoundingBox,
  lineType: T,
  overpassUrl: string = 'https://overpass-api.de/api/interpreter'
): Promise<GenericLine[]> {
  const { south, west, north, east } = boundingBox;
  const config = lineConfig[lineType];
  
  if (!config) {
    throw new Error(`Unsupported line type: ${lineType}`);
  }
  
  // Overpass QL query to get infrastructure lines
  const query = `
    [out:json][timeout:25];
    (
      way["${config.tagKey}"~"${config.type_values?.join("|")}"](${south},${west},${north},${east});
      relation["${config.tagKey}"~"${config.type_values?.join("|")}"](${south},${west},${north},${east});
    );
    out geom;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OverpassResponse = await response.json();
    return processOverpassData(data) as GenericLine[];
  } catch (error) {
    console.error(`Error fetching ${lineType} lines:`, error);
    throw new Error(`Failed to fetch ${lineType} lines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes raw Overpass API response data into GeoJSON-like features
 */
function processOverpassData(
  data: OverpassResponse,
): GenericLine[] {
  const lines: GenericLine[] = [];
  const nodeMap = new Map<number, { lat: number; lon: number }>();

  // First pass: collect all nodes
  data.elements.forEach(element => {
    if (element.type === 'node' && element.lat && element.lon) {
      nodeMap.set(element.id, { lat: element.lat, lon: element.lon });
    }
  });

  // Second pass: process ways and relations
  data.elements.forEach(element => {
    if (element.type === 'way' && element.nodes && element.tags) {
      const coordinates: number[][] = [];
      element.geometry?.forEach(coor => {
        if (coor) {
          coordinates.push([coor.lon, coor.lat]);
        }
      });

      if (coordinates.length > 1) {
        const line: GenericLine = {
          type: 'Feature',
          id: element.id,
          properties: {
            id: element.id,
            ...element.tags
          },
          geometry: {
            type: 'LineString',
            coordinates
          }
        };
        lines.push(line);
      }
    }
  });

  return lines as GenericLine[];
}

/**
 * Helper function to create a bounding box from center point and radius
 */
export function createBoundingBoxFromCenter(lat: number, lon: number, radiusKm: number): BoundingBox {
  const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
  const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  
  return {
    south: lat - latDelta,
    west: lon - lonDelta,
    north: lat + latDelta,
    east: lon + lonDelta
  };
}

