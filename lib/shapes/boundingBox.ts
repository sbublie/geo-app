import BoundingBox from '@/types/BoundingBox';

/**
 * Helper function to create a bounding box from center point and radius
 */
export default function createBoundingBoxFromCenter(lat: number, lon: number, radiusKm: number): BoundingBox {
  const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
  const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  
  return {
    south: lat - latDelta,
    west: lon - lonDelta,
    north: lat + latDelta,
    east: lon + lonDelta
  };
}

