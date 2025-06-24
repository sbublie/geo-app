import { TreePine } from "lucide-react";
import type { NodeType, NodeConfig } from "@/types/NodeConfig";

export const nodeConfig: Record<NodeType, NodeConfig> = {
  tree: {
    type: "tree",
    type_values: ["tree"],
    layerId: "tree-nodes-layer", 
    sourceId: "tree-nodes",
    colors: {
      hospital: "#16a34a",
      default: "#16a34a"
    },
    tagKey: "natural", // This should match osm_type for the Overpass query
    highlightFields: [
      { key: "amenity", label_key: "type" },
      { key: "name", label_key: "name" },
      { key: "operator", label_key: "operator" }
    ],
    icon: TreePine,
    colorClass: "text-green-600"
  }
}