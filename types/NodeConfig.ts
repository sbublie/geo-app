
export type NodeType = "tree";

export interface HighlightField {
  key: string;
  label_key: string;
  icon?: string;
  color?: string;
}

export interface NodeConfig {
  type: NodeType;
  type_values?: string[];
  layerId: string;
  sourceId: string;
  colors: Record<string, string>;
  tagKey: string;
  highlightFields?: HighlightField[];
  icon: React.ElementType;
  colorClass: string;
}

