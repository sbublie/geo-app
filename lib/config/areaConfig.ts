import { TreePine } from "lucide-react";
import type { AreaType, AreaConfig } from "@/types/AreaConfig";

export const areaConfig: Record<AreaType, AreaConfig> = {
  landuse: {
    tagKey: "landuse",
    tagValues: [
      "farmland",
      "forest",
      "meadow",
      "grass",
      "village_green",
      "residential",
      "commercial",
      "industrial",
      "retail",
      "allotments",
      "cemetery",
      "orchard",
    ],
    layerId: "landuse-areas-layer",
    sourceId: "landuse-areas",
    colors: {
      farmland: "#8B4513", // Brown for farmland
      forest: "#228B22", // Forest green
      meadow: "#90EE90", // Light green
      grass: "#7CFC00", // Lawn green
      village_green: "#32CD32", // Lime green
      residential: "#ADD8E6", // Light blue for residential
      commercial: "#FFD700", // Gold for commercial
      industrial: "#A9A9A9", // Dark gray for industrial
      retail: "#FF6347", // Tomato for retail
      allotments: "#98FB98", // Pale green for allotments
      cemetery: "#D3D3D3", // Light gray for cemetery
      orchard: "#FFDEAD", // Navajo white for orchard
      default: "#16a34a",
    },
    highlightFields: [
      { key: "landuse", labelKey: "type" },
      { key: "name", labelKey: "name" },
      { key: "operator", labelKey: "operator" },
    ],
    icon: TreePine,
    colorClass: "text-green-600",
  },
};
