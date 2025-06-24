

export type LineType = "railway" | "power" | "highway" | "waterway" | "pipeline" ;

export interface HighlightField {
  key: string;
  labelKey: string;
  icon?: string;
  color?: string;
}

export interface LineConfig {
  type: LineType;
  tagValues?: string[]; // Optional for types with multiple values
  layerId: string;
  sourceId: string;
  colors: Record<string, string>;
  widths: Record<string, number>;
  tagKey: string;
  highlightFields?: HighlightField[];
  icon: React.ElementType;
  colorClass: string;
}

