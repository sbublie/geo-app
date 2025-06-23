interface GenericLineProperties {
  id: number;
  name?: string;
  operator?: string;
  [key: string]: string | number | undefined;
}

interface GenericLineGeometry {
  type: "LineString";
  coordinates: number[][];
}

export default interface GenericLine {
  type: "Feature";
  id: number;
  properties: GenericLineProperties;
  geometry: GenericLineGeometry;
}
