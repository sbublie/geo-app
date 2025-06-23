// areas.ts
export function getAreaTypes(t: (key: string) => string) {
  return [
    { value: 'patient', label: t('areas.types.patient'), color: '#7c3aed' }, // Purple - patient holding
    { value: 'red', label: t('areas.types.red'), color: '#dc2626' }, // Red - critical/immediate
    { value: 'yellow', label: t('areas.types.yellow'), color: '#eab308' }, // Yellow - urgent/delayed
    { value: 'green', label: t('areas.types.green'), color: '#16a34a' }, // Green - minor/walking wounded
    { value: 'black_blue', label: t('areas.types.black_blue'), color: '#1e1b4b' }, // Dark blue/black - deceased/expectant
    { value: 'rescue', label: t('areas.types.rescue'), color: '#059669' }, // Teal - rescue operations
    { value: 'loading', label: t('areas.types.loading'), color: '#0891b2' }, // Cyan - logistics/loading
    { value: 'damage', label: t('areas.types.damage'), color: '#ea580c' }, // Orange - damage/hazard
    { value: 'danger', label: t('areas.types.danger'), color: '#b91c1c' }, // Dark red - danger/warning
    { value: 'heli', label: t('areas.types.heli'), color: '#db2777' }, // Pink/magenta - aviation
    { value: 'keep_free', label: t('areas.types.keep_free'), color: '#6b7280' }, // Gray - neutral/restricted
  ];
}