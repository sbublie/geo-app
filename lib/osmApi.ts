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

// Generic line type configuration
interface LineTypeConfig {
  tagKey: string;
  values: string; // Regex pattern for valid values
  description: string;
}

// Configuration for different line types - easily extensible
export const LINE_CONFIGS = {
  railway: {
    tagKey: 'railway',
    values: '^(rail|light_rail|subway|tram|monorail|funicular|narrow_gauge)$',
    description: 'Railway lines (trains, trams, etc.)'
  },
  power: {
    tagKey: 'power',
    values: '^(line|cable|minor_line)$',
    description: 'Power transmission lines'
  },
  highway: {
    tagKey: 'highway',
    values: '^(motorway|trunk|primary|secondary|tertiary)$',
    description: 'Major roads and highways'
  },
  waterway: {
    tagKey: 'waterway',
    values: '^(river|stream|canal|drain)$',
    description: 'Waterways and rivers'
  },
  pipeline: {
    tagKey: 'man_made',
    values: '^(pipeline)$',
    description: 'Pipelines (gas, oil, water)'
  },
  aeroway: {
    tagKey: 'aeroway',
    values: '^(runway|taxiway)$',
    description: 'Airport runways and taxiways'
  }
} as const satisfies Record<string, LineTypeConfig>;

export type LineTypeKey = keyof typeof LINE_CONFIGS;

// Specific property interfaces for type safety
export interface TrainLineProperties extends GenericLineProperties {
  railway: string;
  service?: string;
  usage?: string;
  electrified?: string;
  gauge?: string;
  maxspeed?: string;
}

export interface PowerLineProperties extends GenericLineProperties {
  power: string;
  voltage?: string;
  cables?: string;
  frequency?: string;
  circuits?: string;
  location?: string;
}

export interface HighwayProperties extends GenericLineProperties {
  highway: string;
  maxspeed?: string;
  lanes?: string;
  surface?: string;
  ref?: string;
}

export interface WaterwayProperties extends GenericLineProperties {
  waterway: string;
  width?: string;
  depth?: string;
  boat?: string;
  intermittent?: string;
}

export interface PipelineProperties extends GenericLineProperties {
  man_made: string;
  substance?: string;
  diameter?: string;
  pressure?: string;
  location?: string;
}

export interface AerowayProperties extends GenericLineProperties {
  aeroway: string;
  surface?: string;
  width?: string;
  ref?: string;
}

// Type mapping for specific line types
export type TrainLine = GenericLine & { properties: TrainLineProperties };
export type PowerLine = GenericLine & { properties: PowerLineProperties };
export type HighwayLine = GenericLine & { properties: HighwayProperties };
export type WaterwayLine = GenericLine & { properties: WaterwayProperties };
export type PipelineLine = GenericLine & { properties: PipelineProperties };
export type AerowayLine = GenericLine & { properties: AerowayProperties };

// Union type for all specific line types
export type SpecificLine = 
  | TrainLine 
  | PowerLine 
  | HighwayLine 
  | WaterwayLine 
  | PipelineLine 
  | AerowayLine;

// Type mapping helper
type LineTypeMap = {
  railway: TrainLine;
  power: PowerLine;
  highway: HighwayLine;
  waterway: WaterwayLine;
  pipeline: PipelineLine;
  aeroway: AerowayLine;
};

/**
 * Generic function to fetch infrastructure lines in a specified bounding box area using the OSM Overpass API
 * @param boundingBox - The geographical area to search within
 * @param lineType - Type of infrastructure line to fetch
 * @param overpassUrl - Optional custom Overpass API endpoint
 * @returns Promise resolving to an array of line features
 */
export async function getInfrastructureLinesInArea<T extends LineTypeKey>(
  boundingBox: BoundingBox,
  lineType: T,
  overpassUrl: string = 'https://overpass-api.de/api/interpreter'
): Promise<LineTypeMap[T][]> {
  const { south, west, north, east } = boundingBox;
  const config = LINE_CONFIGS[lineType];
  
  if (!config) {
    throw new Error(`Unsupported line type: ${lineType}`);
  }
  
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
    return processOverpassData(data, lineType) as LineTypeMap[T][];
  } catch (error) {
    console.error(`Error fetching ${lineType} lines:`, error);
    throw new Error(`Failed to fetch ${lineType} lines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes raw Overpass API response data into GeoJSON-like features
 */
function processOverpassData<T extends LineTypeKey>(
  data: OverpassResponse,
  lineType: T
): LineTypeMap[T][] {
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

  return lines as LineTypeMap[T][];
}

/**
 * Helper function to create a bounding box from center point and radius
 * @param lat - Center latitude
 * @param lon - Center longitude  
 * @param radiusKm - Radius in kilometers
 * @returns BoundingBox object
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

/**
 * Get all available line type configurations
 */
export function getAvailableLineTypes(): Array<{ key: LineTypeKey; config: LineTypeConfig }> {
  return Object.entries(LINE_CONFIGS).map(([key, config]) => ({
    key: key as LineTypeKey,
    config
  }));
}

// Convenience functions for specific line types (backward compatibility)
export async function getTrainLinesInArea(
  boundingBox: BoundingBox,
  overpassUrl?: string
): Promise<TrainLine[]> {
  return getInfrastructureLinesInArea(boundingBox, 'railway', overpassUrl);
}

export async function getPowerLinesInArea(
  boundingBox: BoundingBox,
  overpassUrl?: string
): Promise<PowerLine[]> {
  return getInfrastructureLinesInArea(boundingBox, 'power', overpassUrl);
}

export async function getHighwayLinesInArea(
  boundingBox: BoundingBox,
  overpassUrl?: string
): Promise<HighwayLine[]> {
  return getInfrastructureLinesInArea(boundingBox, 'highway', overpassUrl);
}

export async function getWaterwayLinesInArea(
  boundingBox: BoundingBox,
  overpassUrl?: string
): Promise<WaterwayLine[]> {
  return getInfrastructureLinesInArea(boundingBox, 'waterway', overpassUrl);
}

export async function getPipelineLinesInArea(
  boundingBox: BoundingBox,
  overpassUrl?: string
): Promise<PipelineLine[]> {
  return getInfrastructureLinesInArea(boundingBox, 'pipeline', overpassUrl);
}

export async function getAerowayLinesInArea(
  boundingBox: BoundingBox,
  overpassUrl?: string
): Promise<AerowayLine[]> {
  return getInfrastructureLinesInArea(boundingBox, 'aeroway', overpassUrl);
}

// Export types
export type { BoundingBox, GenericLine, LineTypeConfig };