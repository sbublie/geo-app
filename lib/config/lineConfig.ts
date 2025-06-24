import { Train, Zap, Car, Waves, Circle } from "lucide-react";
import type { LineType, LineConfig } from "@/types/LineConfig";

export function getAvailableLineTypes(): Array<{ key: LineType; config: LineConfig }> {
  return Object.entries(lineConfig).map(([key, config]) => ({
    key: key as LineType,
    config
  }));
}

// Config for all line types
export const lineConfig: Record<LineType, LineConfig> = {
  railway: {
    tagValues: ["rail", "light_rail", "subway", "tram"],
    colors: {
      rail: "#16a34a",
      light_rail: "#16a34a",
      subway: "#16a34a",
      tram: "#16a34a",
      default: "#16a34a"
    },
    widths: {
      rail: 3,
      light_rail: 2,
      subway: 2,
      default: 1
    },
    tagKey: "railway",
    highlightFields: [
      { key: "railway", labelKey: "type" },
      { key: "service", labelKey: "service" },
      { key: "electrified", labelKey: "electrified" },
      { key: "maxspeed", labelKey: "maxspeed" }
    ],
    icon: Train,
    colorClass: "text-green-600"
  },
  power: {
    tagValues: ["line", "cable", "minor_line"],
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
      { key: "power", labelKey: "type" },
      { key: "voltage", labelKey: "voltage" }
    ],
    icon: Zap,
    colorClass: "text-red-600"
  },
  highway: {
    tagValues: ["motorway", "trunk", "primary", "secondary", "tertiary", "track", "cycleway", "residential"],
    colors: {
      motorway: "#f59e42",
      trunk: "#f59e42",
      primary: "#fbbf24",
      secondary: "#f59e42",
      tertiary: "#fbbf24",
      default: "#fbbf24"
    },
    widths: {
      motorway: 8,
      trunk: 8,
      primary: 8,
      secondary: 5,
      tertiary: 5,
      default: 5
    },
    tagKey: "highway",
    highlightFields: [
      { key: "highway", labelKey: "type" },
      { key: "maxspeed", labelKey: "maxspeed" }
    ],
    icon: Car,
    colorClass: "text-yellow-300"
  },
  waterway: {
    tagValues: ["river", "stream", "canal", "drain"],
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
      { key: "waterway", labelKey: "type" },
      { key: "width", labelKey: "width" }
    ],
    icon: Waves,
    colorClass: "text-blue-400"
  },
  pipeline: {
    //tagValues: [],
    
    colors: {
      pipeline: "#747474",
      default: "#747474"
    },
    widths: {
      pipeline: 2,
      default: 2
    },
    tagKey: "man_made",
    highlightFields: [
      { key: "man_made", labelKey: "type" },
      { key: "substance", labelKey: "substance" }
    ],
    icon: Circle,
    colorClass: "text-grey-600"
  }
};