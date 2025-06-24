

export type LineType = "railway" | "power" | "highway" | "waterway" | "pipeline" ;

export interface HighlightField {
  key: string;
  labelKey: string;
  icon?: string;
  color?: string;
}

export interface LineConfig {
  tagValues?: string[]; // Optional for types with multiple values
  colors: Record<string, string>;
  widths: Record<string, number>;
  tagKey: string;
  highlightFields?: HighlightField[];
  icon: React.ElementType;
  colorClass: string;
}

