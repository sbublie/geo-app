interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

interface GenericLineProperties {
  id: number;
  name?: string;
  operator?: string;
  [key: string]: string | number | undefined;
}

interface GenericLineGeometry {
  type: 'LineString';
  coordinates: number[][];
}

interface GenericLine {
  type: 'Feature';
  id: number;
  properties: GenericLineProperties;
  geometry: GenericLineGeometry;
}

// Specific interfaces for different line types
interface TrainLineProperties extends GenericLineProperties {
  railway: string;
  service?: string;
  usage?: string;
  electrified?: string;
  gauge?: string;
  maxspeed?: string;
}

interface PowerLineProperties extends GenericLineProperties {
  power: string;
  voltage?: string;
  cables?: string;
  frequency?: string;
  circuits?: string;
  location?: string;
}

type TrainLine = GenericLine & { properties: TrainLineProperties };
type PowerLine = GenericLine & { properties: PowerLineProperties };

interface OverpassResponse {
  version: number;
  generator: string;
  elements: Array<{
    type: string;
    id: number;
    nodes?: number[];
    tags?: { [key: string]: string };
    lat?: number;
    lon?: number;
    geometry?: Array<{
      lat: number;
      lon: number;
    }>;
  }>;
}

// Configuration for different line types
const LINE_CONFIGS = {
  railway: {
    tagKey: 'railway',
    values: '^(rail|light_rail|subway|tram|monorail|funicular|narrow_gauge)$'
  },
  power: {
    tagKey: 'power',
    values: '^(line|cable|minor_line)$'
  }
} as const;

type LineType = keyof typeof LINE_CONFIGS;

/**
 * Generic function to fetch infrastructure lines in a specified bounding box area using the OSM Overpass API
 * @param boundingBox - The geographical area to search within
 * @param lineType - Type of infrastructure line to fetch ('railway' or 'power')
 * @param overpassUrl - Optional custom Overpass API endpoint
 * @returns Promise resolving to an array of line features
 */
async function getInfrastructureLinesInArea<T extends LineType>(
  boundingBox: BoundingBox,
  lineType: T,
  overpassUrl: string = 'https://overpass-api.de/api/interpreter'
): Promise<T extends 'railway' ? TrainLine[] : PowerLine[]> {
  const { south, west, north, east } = boundingBox;
  const config = LINE_CONFIGS[lineType];
  
  // Overpass QL query to get infrastructure lines
  const query = `
    [out:json][timeout:25];
    (
      way["${config.tagKey}"~"${config.values}"](${south},${west},${north},${east});
      relation["${config.tagKey}"~"${config.values}"](${south},${west},${north},${east});
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
    return processOverpassData(data, lineType) as T extends 'railway' ? TrainLine[] : PowerLine[];
  } catch (error) {
    console.error(`Error fetching ${lineType} lines:`, error);
    throw new Error(`Failed to fetch ${lineType} lines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes raw Overpass API response data into GeoJSON-like features
 */
function processOverpassData<T extends LineType>(
  data: OverpassResponse,
  lineType: T
): T extends 'railway' ? TrainLine[] : PowerLine[] {
  const lines: GenericLine[] = [];
  const nodeMap = new Map<number, { lat: number; lon: number }>();

  console.log(`Processing ${data.elements.length} elements for ${lineType} lines...`);

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
      
      // Convert node references to coordinates
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

  return lines as T extends 'railway' ? TrainLine[] : PowerLine[];
}

/**
 * Helper function to create a bounding box from center point and radius
 * @param lat - Center latitude
 * @param lon - Center longitude  
 * @param radiusKm - Radius in kilometers
 * @returns BoundingBox object
 */
function createBoundingBoxFromCenter(lat: number, lon: number, radiusKm: number): BoundingBox {
  const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
  const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  
  return {
    south: lat - latDelta,
    west: lon - lonDelta,
    north: lat + latDelta,
    east: lon + lonDelta
  };
}

// Convenience functions for specific line types
async function getTrainLinesInArea(
  boundingBox: BoundingBox,
  overpassUrl?: string
): Promise<TrainLine[]> {
  return getInfrastructureLinesInArea(boundingBox, 'railway', overpassUrl);
}

async function getPowerLinesInArea(
  boundingBox: BoundingBox,
  overpassUrl?: string
): Promise<PowerLine[]> {
  return getInfrastructureLinesInArea(boundingBox, 'power', overpassUrl);
}

export { 
  getInfrastructureLinesInArea,
  getTrainLinesInArea,
  getPowerLinesInArea,
  createBoundingBoxFromCenter,
  type BoundingBox, 
  type GenericLine,
  type TrainLine,
  type PowerLine,
  type TrainLineProperties,
  type PowerLineProperties,
  type LineType
};