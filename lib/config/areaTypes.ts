import AreaType from "@/types/AreaType"

export const areaTypes: AreaType[] = [
    { value: 'patient', label_key: 'areas.types.patient', color: '#7c3aed' }, // Purple - patient holding
    { value: 'red', label_key: 'areas.types.red', color: '#dc2626' }, // Red - critical/immediate
    { value: 'yellow', label_key: 'areas.types.yellow', color: '#eab308' }, // Yellow - urgent/delayed
    { value: 'green', label_key: 'areas.types.green', color: '#16a34a' }, // Green - minor/walking wounded
    { value: 'black_blue', label_key: 'areas.types.black_blue', color: '#1e1b4b' }, // Dark blue/black - deceased/expectant
    { value: 'rescue', label_key: 'areas.types.rescue', color: '#059669' }, // Teal - rescue operations
    { value: 'loading', label_key: 'areas.types.loading', color: '#0891b2' }, // Cyan - logistics/loading
    { value: 'damage', label_key: 'areas.types.damage', color: '#ea580c' }, // Orange - damage/hazard
    { value: 'danger', label_key: 'areas.types.danger', color: '#b91c1c' }, // Dark red - danger/warning
    { value: 'heli', label_key: 'areas.types.heli', color: '#db2777' }, // Pink/magenta - aviation
    { value: 'keep_free', label_key: 'areas.types.keep_free', color: '#6b7280' }, // Gray - neutral/restricted
  ]