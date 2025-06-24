import BoundingBox from "@/types/BoundingBox";
import GenericNode from "@/types/GenericNode";
import OverpassResponse from "@/types/OverpassResponse";
import { NodeType } from "@/types/NodeConfig";
import { nodeConfig } from "@/lib/config/nodeConfig";



/**
 * Generic function to fetch all enabled infrastructure nodes in a specified bounding box area using the OSM Overpass API
 */
export async function getAllInfrastructureNodes(
  boundingBox: BoundingBox,
  overpassUrl: string = 'https://overpass-api.de/api/interpreter'
): Promise<Record<NodeType, GenericNode[]>> {
  const { south, west, north, east } = boundingBox;
const enabledTypes = Object.keys(nodeConfig) as NodeType[];

  // Build the combined Overpass QL query
  let query = `[out:json][timeout:25];(`;
  for (const type of enabledTypes) {
    const config = nodeConfig[type];
    if (!config) continue;
    const values = config.tagValues?.join('|') || '';
    query += `
      node["${config.tagKey}"~"${values}"](${south},${west},${north},${east});
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
    return splitNodesByType(data, enabledTypes);
  } catch (error) {
    console.error('Error fetching nodes:', error);
    throw new Error(`Failed to fetch nodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper: Split nodes by type after fetching
function splitNodesByType(
  data: OverpassResponse,
  enabledTypes: NodeType[]
): Record<NodeType, GenericNode[]> {
  // Initialize result with proper typing
  const result = {} as Record<NodeType, GenericNode[]>;
  
  // Initialize arrays for each enabled type
  enabledTypes.forEach(type => {
    result[type] = [];
  });

  data.elements.forEach(element => {
    if ((element.type === 'node' || element.type === 'way') && element.tags) {
      for (const type of enabledTypes) {
        const config = nodeConfig[type];
        if (
          config &&
          element.tags[config.tagKey] &&
          (!config.tagValues || config.tagValues.includes(element.tags[config.tagKey]))
        ) {
          let coordinates: [number, number];
          
          if (element.type === 'node' && element.lat && element.lon) {
            coordinates = [element.lon, element.lat];
          } else if (element.type === 'way' && element.geometry && element.geometry.length > 0) {
            // Use center point for ways
            const lats = element.geometry.map(coord => coord.lat);
            const lons = element.geometry.map(coord => coord.lon);
            const centerLat = lats.reduce((a, b) => a + b) / lats.length;
            const centerLon = lons.reduce((a, b) => a + b) / lons.length;
            coordinates = [centerLon, centerLat];
          } else {
            continue;
          }
          
          // Ensure the array exists before pushing
          if (!result[type]) {
            result[type] = [];
          }
          
          result[type].push({
            type: 'Feature',
            id: element.id,
            properties: { id: element.id, ...element.tags },
            geometry: { type: 'Point', coordinates }
          });
          break; // Only assign to the first matching type
        }
      }
    }
  });

  return result;
}