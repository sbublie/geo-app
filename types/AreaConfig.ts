export type AreaType = "landuse";

export interface HighlightField {
  key: string;
  labelKey: string;
  icon?: string;
  color?: string;
}

export interface AreaConfig {
  tagKey: string;
  tagValues?: string[]; // Optional for types with multiple values
  colors: Record<string, string>;
  highlightFields?: HighlightField[];
  icon: React.ElementType;
  colorClass: string;
  // Add these missing properties for consistency with line/node configs
  layerId: string;
  sourceId: string;
}
