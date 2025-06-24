import DrawAreaType from "@/types/DrawAreaType";

export const drawAreaTypes: DrawAreaType[] = [
  { value: "patient", labelKey: "areas.types.patient", color: "#7c3aed" }, // Purple - patient holding
  { value: "red", labelKey: "areas.types.red", color: "#dc2626" }, // Red - critical/immediate
  { value: "yellow", labelKey: "areas.types.yellow", color: "#eab308" }, // Yellow - urgent/delayed
  { value: "green", labelKey: "areas.types.green", color: "#16a34a" }, // Green - minor/walking wounded
  { value: "black_blue", labelKey: "areas.types.black_blue", color: "#1e1b4b" }, // Dark blue/black - deceased/expectant
  { value: "rescue", labelKey: "areas.types.rescue", color: "#059669" }, // Teal - rescue operations
  { value: "loading", labelKey: "areas.types.loading", color: "#0891b2" }, // Cyan - logistics/loading
  { value: "damage", labelKey: "areas.types.damage", color: "#ea580c" }, // Orange - damage/hazard
  { value: "danger", labelKey: "areas.types.danger", color: "#b91c1c" }, // Dark red - danger/warning
  { value: "heli", labelKey: "areas.types.heli", color: "#db2777" }, // Pink/magenta - aviation
  { value: "keep_free", labelKey: "areas.types.keep_free", color: "#6b7280" }, // Gray - neutral/restricted
];
