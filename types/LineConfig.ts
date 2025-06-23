import { Train, Zap, Car, Waves, Plane, Circle } from 'lucide-react';

export type LineType = "railway" | "power" | "highway" | "waterway" | "pipeline" ;

export interface HighlightField {
  key: string;
  label_key: string;
  icon?: string;
  color?: string;
}

export interface LineConfig {
  type: LineType;
  type_values?: string[]; // Optional for types with multiple values
  layerId: string;
  sourceId: string;
  colors: Record<string, string>;
  widths: Record<string, number>;
  tagKey: string;
  highlightFields?: HighlightField[];
  icon: React.ElementType;
  colorClass: string;
}

// Config for all line types
export const LINE_CONFIGS: Record<LineType, LineConfig> = {
  railway: {
    type: "railway",
    type_values: ["rail", "light_rail", "subway", "tram"],
    layerId: "railway-lines-layer",
    sourceId: "railway-lines",
    colors: {
      rail: "#2563eb",
      light_rail: "#16a34a",
      subway: "#dc2626",
      tram: "#ea580c",
      default: "#6b7280"
    },
    widths: {
      rail: 3,
      light_rail: 2,
      subway: 2,
      default: 1
    },
    tagKey: "railway",
    highlightFields: [
      { key: "railway", label_key: "type" },
      { key: "service", label_key: "service" },
      { key: "electrified", label_key: "electrified" },
      { key: "maxspeed", label_key: "maxspeed" }
    ],
    icon: Train,
    colorClass: "text-green-600"
  },
  power: {
    type: "power",
    type_values: ["line", "cable", "minor_line"],
    layerId: "power-lines-layer",
    sourceId: "power-lines",
    colors: {
      line: "#dc2626",
      cable: "#dc2626",
      minor_line: "#dc2626",
      default: "#dc2626"
    },
    widths: {
      line: 4,
      cable: 2,
      minor_line: 2,
      default: 2
    },
    tagKey: "power",
    highlightFields: [
      { key: "power", label_key: "type" },
      { key: "voltage", label_key: "voltage" }
    ],
    icon: Zap,
    colorClass: "text-red-600"
  },
  highway: {
    type: "highway",
    type_values: ["motorway", "trunk", "primary", "secondary", "tertiary"],
    layerId: "highway-lines-layer",
    sourceId: "highway-lines",
    colors: {
      motorway: "#6366f1",
      trunk: "#f59e42",
      primary: "#fbbf24",
      secondary: "#f59e42",
      tertiary: "#fbbf24",
      default: "#6b7280"
    },
    widths: {
      motorway: 4,
      trunk: 3,
      primary: 2,
      secondary: 2,
      tertiary: 1,
      default: 1
    },
    tagKey: "highway",
    highlightFields: [
      { key: "highway", label_key: "type" },
      { key: "maxspeed", label_key: "maxspeed" }
    ],
    icon: Car,
    colorClass: "text-yellow-300"
  },
  waterway: {
    type: "waterway",
    type_values: ["river", "stream", "canal", "drain"],
    layerId: "waterway-lines-layer",
    sourceId: "waterway-lines",
    colors: {
      river: "#38bdf8",
      stream: "#0ea5e9",
      canal: "#06b6d4",
      drain: "#0ea5e9",
      default: "#38bdf8"
    },
    widths: {
      river: 3,
      stream: 2,
      canal: 2,
      drain: 1,
      default: 1
    },
    tagKey: "waterway",
    highlightFields: [
      { key: "waterway", label_key: "type" },
      { key: "width", label_key: "width" }
    ],
    icon: Waves,
    colorClass: "text-blue-400"
  },
  pipeline: {
    type: "pipeline",
    type_values: [],
    layerId: "pipeline-lines-layer",
    sourceId: "pipeline-lines",
    colors: {
      pipeline: "#ea580c",
      default: "#ea580c"
    },
    widths: {
      pipeline: 2,
      default: 2
    },
    tagKey: "man_made",
    highlightFields: [
      { key: "man_made", label_key: "type" },
      { key: "substance", label_key: "substance" }
    ],
    icon: Circle,
    colorClass: "text-grey-600"
  }
};