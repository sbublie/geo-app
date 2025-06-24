import React from "react";
import { SelectSeparator } from "../ui/select";
import { useTranslations } from "next-intl";
import { LineType } from "@/types/LineConfig";
import { lineConfig } from '@/lib/config/lineConfig';
import { NodeType } from "@/types/NodeConfig";
import { nodeConfig } from '@/lib/config/nodeConfig';
import { AreaType } from "@/types/AreaConfig";
import { areaConfig } from '@/lib/config/areaConfig';
import GenericNode from "@/types/GenericNode";
import { GenericLineFeature } from "@/lib/shapes/lines";
import { GenericAreaFeature } from "@/lib/shapes/area";

interface DetailsDialogProps {
  selectedObject: GenericLineFeature | GenericNode | GenericAreaFeature;
  onClose: () => void;
}

export default function DetailsDialog({ selectedObject, onClose }: DetailsDialogProps) {
  // Always call hooks at the top
  const lineTranslations = useTranslations("osm.lines");
  const nodeTranslations = useTranslations("osm.nodes");
  const areaTranslations = useTranslations("osm.areas");

  if (!selectedObject) return null;

  const properties = selectedObject.properties || {};

  // Determine type based on geometry and properties
  function determineType(): { type: LineType | NodeType | AreaType; objectType: 'line' | 'node' | 'area' } {
    const geometryType = selectedObject.geometry.type;
    
    if (geometryType === 'LineString') {
      // It's a line - check which line type
      for (const [lineType, config] of Object.entries(lineConfig)) {
        if (properties[config.tagKey]) {
          return { type: lineType as LineType, objectType: 'line' };
        }
      }
      return { type: 'railway' as LineType, objectType: 'line' }; // fallback
    } else if (geometryType === 'Point') {
      // It's a node - check which node type
      for (const [nodeType, config] of Object.entries(nodeConfig)) {
        if (properties[config.tagKey]) {
          return { type: nodeType as NodeType, objectType: 'node' };
        }
      }
      return { type: 'tree' as NodeType, objectType: 'node' }; // fallback
    } else if (geometryType === 'Polygon') {
      // It's an area - check which area type
      for (const [areaType, config] of Object.entries(areaConfig)) {
        if (properties[config.tagKey]) {
          return { type: areaType as AreaType, objectType: 'area' };
        }
      }
      return { type: 'landuse' as AreaType, objectType: 'area' }; // fallback
    }
    
    // Default fallback
    return { type: 'railway' as LineType, objectType: 'line' };
  }

  const { type, objectType } = determineType();
  
  // Get appropriate config and translations based on object type
  let config;
  let t;
  
  switch (objectType) {
    case 'line':
      config = lineConfig[type as LineType];
      t = lineTranslations;
      break;
    case 'node':
      config = nodeConfig[type as NodeType];
      t = nodeTranslations;
      break;
    case 'area':
      config = areaConfig[type as AreaType];
      t = areaTranslations;
      break;
    default:
      config = lineConfig[type as LineType];
      t = lineTranslations;
  }

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
        {highlightFields.map(({ key, labelKey, color }) =>
          properties[key] ? (
            <div
              key={key}
              className={`text-sm ${color ? `bg-${color}-50` : ""} rounded`}
            >
              <span className={`font-semibold ${color ? `text-${color}-800` : ""}`}>
                {t(`${type}.${labelKey}`) || labelKey}:
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