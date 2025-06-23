import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Filter, Train, Zap, Car, Waves, Power, Plane } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LineTypeKey, LINE_CONFIGS } from '@/lib/osmApi';

interface FilterMenuProps {
  lineVisibility: Record<LineTypeKey, boolean>;
  enabledLineTypes: LineTypeKey[];
  onToggleLineType: (lineType: LineTypeKey, show: boolean) => void;
}

// Icon mapping for different line types
const LINE_TYPE_ICONS = {
  railway: Train,
  power: Zap,
  highway: Car,
  waterway: Waves,
  pipeline: Power,
  aeroway: Plane,
} as const;

// Color mapping for different line types
const LINE_TYPE_COLORS = {
  railway: 'text-blue-600',
  power: 'text-red-600',
  highway: 'text-gray-600',
  waterway: 'text-blue-400',
  pipeline: 'text-orange-600',
  aeroway: 'text-purple-600',
} as const;

export default function FilterMenu({
  lineVisibility,
  enabledLineTypes,
  onToggleLineType,
}: FilterMenuProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border flex items-center gap-2"
        >
          <Filter size={16} />
          {t('filters.title')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white ml-8">
        <DropdownMenuLabel>{t('filters.mapElements')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-3">
          {enabledLineTypes.map((lineType) => {
            const IconComponent = LINE_TYPE_ICONS[lineType] || Filter;
            const colorClass = LINE_TYPE_COLORS[lineType] || 'text-gray-600';
            const config = LINE_CONFIGS[lineType];
            
            return (
              <div key={lineType} className="flex items-center space-x-2">
                <Checkbox
                  id={`${lineType}-lines`}
                  checked={lineVisibility[lineType] || false}
                  onCheckedChange={(show) => onToggleLineType(lineType, !!show)}
                />
                <label
                  htmlFor={`${lineType}-lines`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                >
                  <IconComponent size={16} className={colorClass} />
                  {t(`filters.${lineType}Lines`) || config.description}
                </label>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}