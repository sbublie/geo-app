import { LineType } from '@/types/LineConfig';
import { lineConfig } from '@/lib/config/lineConfig';
import GenericLine from '@/types/GenericLine';
import OverpassResponse from '@/types/OverpassResponse';
import BoundingBox from '@/types/BoundingBox';

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
      way["${config.tagKey}"~"${config.tagValues?.join("|")}"](${south},${west},${north},${east});
      relation["${config.tagKey}"~"${config.tagValues?.join("|")}"](${south},${west},${north},${east});
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
 * Generic function to fetch all enabled infrastructure lines in a specified bounding box area using the OSM Overpass API
 */
export async function getAllInfrastructureLines(
  boundingBox: BoundingBox,
  enabledTypes: LineType[],
  overpassUrl: string = 'https://overpass-api.de/api/interpreter'
): Promise<Record<LineType, GenericLine[]>> {
  const { south, west, north, east } = boundingBox;

  // Build the combined Overpass QL query
  let query = `[out:json][timeout:25];(`;
  for (const type of enabledTypes) {
    const config = lineConfig[type];
    if (!config) continue;
    const values = config.tagValues?.join('|') || '';
    query += `
      way["${config.tagKey}"~"${values}"](${south},${west},${north},${east});
      relation["${config.tagKey}"~"${values}"](${south},${west},${north},${east});
    `;
  }
  query += `);out geom;`;

  // Fetch and process
  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OverpassResponse = await response.json();
    return splitLinesByType(data, enabledTypes);
  } catch (error) {
    console.error('Error fetching lines:', error);
    throw new Error(`Failed to fetch lines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper: Split lines by type after fetching
function splitLinesByType(
  data: OverpassResponse,
  enabledTypes: LineType[]
): Record<LineType, GenericLine[]> {
  const result: Record<LineType, GenericLine[]> = {
    railway: [],
    power: [],
    highway: [],
    waterway: [],
    pipeline: [],
  };

  // Only keep enabled types
  enabledTypes.forEach(type => {
    result[type] = [];
  });

  data.elements.forEach(element => {
    if (element.type === 'way' && element.tags && element.geometry) {
      for (const type of enabledTypes) {
        const config = lineConfig[type];
        if (
          config &&
          element.tags[config.tagKey] &&
          (!config.tagValues || config.tagValues.includes(element.tags[config.tagKey]))
        ) {
          const coordinates = element.geometry.map(coor => [coor.lon, coor.lat]);
          if (coordinates.length > 1) {
            result[type].push({
              type: 'Feature',
              id: element.id,
              properties: { id: element.id, ...element.tags },
              geometry: { type: 'LineString', coordinates }
            });
          }
          break; // Only assign to the first matching type
        }
      }
    }
  });

  return result;
}

