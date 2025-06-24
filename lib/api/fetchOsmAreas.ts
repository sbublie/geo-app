import BoundingBox from "@/types/BoundingBox";
import GenericArea from "@/types/GenericArea";
import OverpassResponse from "@/types/OverpassResponse";
import { AreaType } from "@/types/AreaConfig";
import { areaConfig } from "@/lib/config/areaConfig";

/**
 * Generic function to fetch infrastructure areas in a specified bounding box area using the OSM Overpass API
 */
export async function getInfrastructureAreasInArea<T extends AreaType>(
  boundingBox: BoundingBox,
  areaType: T,
  overpassUrl: string = 'https://overpass-api.de/api/interpreter'
): Promise<GenericArea[]> {
  const { south, west, north, east } = boundingBox;
  const config = areaConfig[areaType];
  
  if (!config) {
    throw new Error(`Unsupported area type: ${areaType}`);
  }
  
  // Overpass QL query to get infrastructure areas
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
    return processOverpassAreaData(data);
  } catch (error) {
    console.error(`Error fetching ${areaType} areas:`, error);
    throw new Error(`Failed to fetch ${areaType} areas: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes raw Overpass API response data into GeoJSON-like area features
 */
function processOverpassAreaData(data: OverpassResponse): GenericArea[] {
  const areas: GenericArea[] = [];

  data.elements.forEach(element => {
    if (element.type === 'way' && element.tags && element.geometry && element.geometry.length > 2) {
      // Ensure the way is closed (first and last coordinates are the same)
      const coordinates = element.geometry.map(coord => [coord.lon, coord.lat]);
      if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
          coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
        coordinates.push(coordinates[0]); // Close the polygon
      }

      const area: GenericArea = {
        type: 'Feature',
        id: element.id,
        properties: {
          id: element.id,
          ...element.tags
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates] // Single ring polygon
        }
      };
      areas.push(area);
    }
    
    // Handle relations (multipolygons)
    if (element.type === 'relation' && element.tags && 'members' in element) {
      // For simplicity, we'll skip complex multipolygon handling for now
      // In a full implementation, you'd need to process relation members
    }
  });

  return areas;
}

/**
 * Generic function to fetch all enabled infrastructure areas in a specified bounding box area using the OSM Overpass API
 */
export async function getAllInfrastructureAreas(
  boundingBox: BoundingBox,
  overpassUrl: string = 'https://overpass-api.de/api/interpreter'
): Promise<Record<AreaType, GenericArea[]>> {
  const { south, west, north, east } = boundingBox;
  const enabledTypes = Object.keys(areaConfig) as AreaType[];

  // Build the combined Overpass QL query
  let query = `[out:json][timeout:25];(`;
  for (const type of enabledTypes) {
    const config = areaConfig[type];
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
    return splitAreasByType(data, enabledTypes);
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw new Error(`Failed to fetch areas: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper: Split areas by type after fetching
function splitAreasByType(
  data: OverpassResponse,
  enabledTypes: AreaType[]
): Record<AreaType, GenericArea[]> {
  // Initialize result with proper typing
  const result = {} as Record<AreaType, GenericArea[]>;
  
  // Initialize arrays for each enabled type
  enabledTypes.forEach(type => {
    result[type] = [];
  });

  data.elements.forEach(element => {
    if (element.type === 'way' && element.tags && element.geometry && element.geometry.length > 2) {
      for (const type of enabledTypes) {
        const config = areaConfig[type];
        if (
          config &&
          element.tags[config.tagKey] &&
          (!config.tagValues || config.tagValues.includes(element.tags[config.tagKey]))
        ) {
          // Ensure the way is closed
          const coordinates = element.geometry.map(coord => [coord.lon, coord.lat]);
          if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
              coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
            coordinates.push(coordinates[0]);
          }
          
          // Ensure the array exists before pushing
          if (!result[type]) {
            result[type] = [];
          }
          
          result[type].push({
            type: 'Feature',
            id: element.id,
            properties: { id: element.id, ...element.tags },
            geometry: { type: 'Polygon', coordinates: [coordinates] }
          });
          break; // Only assign to the first matching type
        }
      }
    }
  });

  return result;
}