
export type NodeType = "tree" | "power";

export interface HighlightField {
  key: string;
  labelKey: string;
  icon?: string;
  color?: string;
}

export interface NodeConfig {
  tagValues?: string[];
  colors: Record<string, string>;
  tagKey: string;
  highlightFields?: HighlightField[];
  icon: React.ElementType;
  colorClass: string;
}

