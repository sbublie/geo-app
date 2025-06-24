import React from "react";
import { SelectSeparator } from "../ui/select";
import { useTranslations } from "next-intl";
import { LineType } from "@/types/LineConfig";
import { lineConfig } from '@/lib/config/lineConfig';
import { NodeType } from "@/types/NodeConfig";
import { nodeConfig } from '@/lib/config/nodeConfig';
import GenericNode from "@/types/GenericNode";
import { GenericLineFeature } from "@/lib/shapes/lines";

interface DetailsDialogProps {
  selectedObject: GenericLineFeature | GenericNode;
  onClose: () => void;
}

export default function DetailsDialog({ selectedObject, onClose }: DetailsDialogProps) {
  // Always call hooks at the top
  const lineTranslations = useTranslations("osm.lines");
  const nodeTranslations = useTranslations("osm.nodes");

  if (!selectedObject) return null;

  const properties = selectedObject.properties || {};

  // Determine type based on geometry and properties
  function determineType(): { type: LineType | NodeType; isLine: boolean } {
    const isLineGeometry = selectedObject.geometry.type === 'LineString';
    
    if (isLineGeometry) {
      // It's a line - check which line type
      for (const [lineType, config] of Object.entries(lineConfig)) {
        if (properties[config.tagKey]) {
          return { type: lineType as LineType, isLine: true };
        }
      }
      return { type: 'railway' as LineType, isLine: true }; // fallback
    } else {
      // It's a node - check which node type
      for (const [nodeType, config] of Object.entries(nodeConfig)) {
        if (properties[config.tagKey]) {
          return { type: nodeType as NodeType, isLine: false };
        }
      }
      return { type: 'tree' as NodeType, isLine: false }; // fallback
    }
  }

  const { type, isLine } = determineType();
  const config = isLine ? lineConfig[type as LineType] : nodeConfig[type as NodeType];
  const t = isLine ? lineTranslations : nodeTranslations;
  const highlightFields = config.highlightFields || [];

  // Check if there are any highlight fields with values
  const hasHighlightFields = highlightFields.some(field => properties[field.key]);

  return (
    <div className="bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border max-w-[350px] max-h-[400px] min-w-[250px] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">
          {properties.name || t(`${type}.title`) || `${type} Details`}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>
      <SelectSeparator className="mb-3 h-[4px]" />

      <div className="space-y-2">
        {highlightFields.map(({ key, label_key, color }) =>
          properties[key] ? (
            <div
              key={key}
              className={`text-sm ${color ? `bg-${color}-50` : ""} rounded `}
            >
              <span className={`font-semibold ${color ? `text-${color}-800` : ""}`}>
                {t(`${type}.${label_key}`) || label_key}:
              </span>{" "}
              <span className={`${color ? `text-${color}-700 font-bold` : ""}`}>
                {properties[key]}
              </span>
            </div>
          ) : null
        )}
        
        {/* Only show separator if there are highlight fields */}
        {hasHighlightFields && <SelectSeparator className="mb-3 h-[4px]" />}
        
        {/* Display all other properties */}
        {Object.entries(properties).map(([key, value]) => {
          if (
            highlightFields.some((f) => f.key === key) ||
            !value ||
            key === 'id'
          )
            return null;
          return (
            <div key={key} className="text-sm">
              <span className="font-semibold capitalize">
                {key.replace(/_/g, " ")}:
              </span>{" "}
              <span className="text-gray-600">{String(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}