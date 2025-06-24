import { TreePine, Zap } from "lucide-react";
import type { NodeType, NodeConfig } from "@/types/NodeConfig";

export const nodeConfig: Record<NodeType, NodeConfig> = {
  tree: {
    tagKey: "natural", 
    tagValues: ["tree"],
    colors: {
      hospital: "#16a34a",
      default: "#16a34a"
    },
    highlightFields: [
      { key: "amenity", labelKey: "type" },
      { key: "name", labelKey: "name" },
      { key: "operator", labelKey: "operator" }
    ],
    icon: TreePine,
    colorClass: "text-green-600"
  },
  power:{
    tagKey: "power", 
    tagValues: ["pole", "tower"],
    colors: {
      substation: "#dc2626",
      transformer: "#dc2626",
      default: "#dc2626"
    },
    highlightFields: [
      { key: "power", labelKey: "type" },
      { key: "name", labelKey: "name" },
      { key: "operator", labelKey: "operator" }
    ],
    icon: Zap,
    colorClass: "text-red-600"
  }

}