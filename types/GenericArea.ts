interface GenericAreaProperties {
  id: number;
  name?: string;
  operator?: string;
  [key: string]: string | number | undefined;
}

interface GenericAreaGeometry {
  type: "Polygon";
  coordinates: number[][][]; // Array of linear rings
}

export default interface GenericArea {
  type: "Feature";
  id: number;
  properties: GenericAreaProperties;
  geometry: GenericAreaGeometry;
}