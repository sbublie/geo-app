interface GenericNodeProperties {
  id: number;
  name?: string;
  operator?: string;
  [key: string]: string | number | undefined;
}

interface GenericNodeGeometry {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export default interface GenericNode {
  type: "Feature";
  id: number;
  properties: GenericNodeProperties;
  geometry: GenericNodeGeometry;
}