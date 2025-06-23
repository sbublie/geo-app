import React from "react";

type LineType = "train" | "power";

interface LineDetailsDialogProps {
  line: any; // You can use a union type for stricter typing
  type: LineType;
  onClose: () => void;
}

export default function LineDetailsDialog({ line, type, onClose }: LineDetailsDialogProps) {
  if (!line) return null;

  // Define which fields to highlight for each type
  const highlightFields: Record<LineType, { key: string; label: string; icon?: string; color?: string }[]> = {
    train: [
      { key: "railway", label: "Type" },
      { key: "service", label: "🚂 Service", color: "blue" },
      { key: "electrified", label: "⚡ Electrified", color: "green" },
      { key: "maxspeed", label: "🏃 Max Speed", color: "orange" },
    ],
    power: [
      { key: "power", label: "Type" },
      { key: "voltage", label: "⚡ Voltage", color: "yellow" },
    ],
  };

  const properties = line.properties || {};

  return (
    <div className="bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border max-w-[350px] max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">
          {properties.name || (type === "train" ? "Unnamed Railway" : "Unnamed Power Line")}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        {highlightFields[type].map(({ key, label, color }) =>
          properties[key] ? (
            <div
              key={key}
              className={`text-sm ${color ? `bg-${color}-50` : ""} p-2 rounded`}
            >
              <span className={`font-semibold ${color ? `text-${color}-800` : ""}`}>{label}:</span>{" "}
              <span className={`${color ? `text-${color}-700 font-bold` : ""}`}>{properties[key]}</span>
            </div>
          ) : null
        )}

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