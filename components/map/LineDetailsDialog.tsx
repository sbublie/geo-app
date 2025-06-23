import React from "react";
import { SelectSeparator } from "../ui/select";
import { useTranslations } from "next-intl";
import { LineType, LINE_CONFIGS } from "@/types/LineConfig";

interface LineDetailsDialogProps {
  line: { properties: Record<string, any> };
  type: LineType;
  onClose: () => void;
}

export default function LineDetailsDialog({ line, type, onClose }: LineDetailsDialogProps) {
  if (!line) return null;

  const t = useTranslations("osm.lines");
  const properties = line.properties || {};
  const config = LINE_CONFIGS[type];
  const highlightFields = config.highlightFields || [];

  return (
    <div className="bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border max-w-[350px] max-h-[400px] min-w-[250px] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">
          {properties.name || t(`${type}.title`)}
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
              className={`text-sm ${color ? `bg-${color}-50` : ""} rounded`}
            >
              <span className={`font-semibold ${color ? `text-${color}-800` : ""}`}>
                {t(`${type}.${label_key}`) || label_key}:
              </span>{" "}
              <span className={`${color ? `text-${color}-700 font-bold` : ""}`}>{properties[key]}</span>
            </div>
          ) : null
        )}
        <SelectSeparator className="mb-3 h-[4px]" />
        {/* Display all other properties */}
        {Object.entries(properties).map(([key, value]) => {
          if (
            highlightFields.some((f) => f.key === key) ||
            !value
          )
            return null;
          return (
            <div key={key} className="text-sm">
              <span className="font-semibold capitalize">{key.replace(/_/g, " ")}:</span>{" "}
              <span className="text-gray-600">{String(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}