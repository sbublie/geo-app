import React from "react";
import { SelectSeparator } from "../ui/select";
import { useTranslations } from "next-intl";

type LineType = "train" | "power" | "highway" | "waterway" | "pipeline" | "aeroway";

interface LineDetailsDialogProps {
  line: any; // You can use a union type for stricter typing
  type: LineType;
  onClose: () => void;
}

export default function LineDetailsDialog({ line, type, onClose }: LineDetailsDialogProps) {
  if (!line) return null;

  const t = useTranslations("osm.lines");

  // Define which fields to highlight for each type
  const highlightFields: Record<LineType, { key: string; label: string; icon?: string; color?: string }[]> = {
    train: [
      { key: "service", label: t("train.service"), color: "blue" },
      { key: "electrified", label: t("train.electrified"), color: "green" },
      { key: "operator", label: t("train.operator"), color: "yellow" },
      { key: "maxspeed", label: t("train.maxspeed"), color: "yellow" },
      { key: "maxspeed:backward", label: t("train.maxspeedBackward"), color: "yellow" },
      { key: "maxspeed:forward", label: t("train.maxspeedForward"), color: "yellow" },
    ],
    power: [
      { key: "voltage", label: t("power.voltage"), color: "yellow" },
      { key: "operator", label: t("power.operator"), color: "yellow" },
    ],
    highway: [
      { key: "maxspeed", label: t("highway.maxspeed"), color: "yellow" },
      { key: "lanes", label: t("highway.lanes"), color: "blue" },
      { key: "surface", label: t("highway.surface"), color: "green" },
      { key: "ref", label: t("highway.ref"), color: "purple" },
    ],
    waterway: [
      { key: "width", label: t("waterway.width"), color: "blue" },
      { key: "depth", label: t("waterway.depth"), color: "blue" },
      { key: "boat", label: t("waterway.boat"), color: "green" },
      { key: "intermittent", label: t("waterway.intermittent"), color: "orange" },
    ],
    pipeline: [
      { key: "substance", label: t("pipeline.substance"), color: "orange" },
      { key: "diameter", label: t("pipeline.diameter"), color: "blue" },
      { key: "pressure", label: t("pipeline.pressure"), color: "red" },
      { key: "location", label: t("pipeline.location"), color: "green" },
    ],
    aeroway: [
      { key: "surface", label: t("aeroway.surface"), color: "blue" },
      { key: "width", label: t("aeroway.width"), color: "green" },
      { key: "ref", label: t("aeroway.ref"), color: "purple" },
    ],
  };

  const properties = line.properties || {};

  return (
    <div className="bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border max-w-[350px] max-h-[400px] min-w-[250px] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">
          {properties.name || t(`${type}.title`) }
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
        {highlightFields[type].map(({ key, label, color }) =>
          properties[key] ? (
            <div
              key={key}
              className={`text-sm ${color ? `bg-${color}-50` : ""} rounded`}
            >
              <span className={`font-semibold ${color ? `text-${color}-800` : ""}`}>{label}:</span>{" "}
              <span className={`${color ? `text-${color}-700 font-bold` : ""}`}>{properties[key]}</span>
            </div>
          ) : null
        )}
        <SelectSeparator className="mb-3 h-[4px]" />
        {/* Display all other properties */}
        {Object.entries(properties).map(([key, value]) => {
          if (
            highlightFields[type].some((f) => f.key === key) ||
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