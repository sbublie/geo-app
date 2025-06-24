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
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LineType } from '@/types/LineConfig';
import { NodeType } from '@/types/NodeConfig';
import { AreaType } from '@/types/AreaConfig';
import { lineConfig } from '@/lib/config/lineConfig';
import { nodeConfig } from '@/lib/config/nodeConfig';
import { areaConfig } from '@/lib/config/areaConfig';

interface FilterMenuProps {
  lineVisibility: Record<LineType, boolean>;
  enabledLineTypes: LineType[];
  onToggleLineType: (lineType: LineType, show: boolean) => void;

  nodeVisibility: Record<NodeType, boolean>;
  enabledNodeTypes: NodeType[];
  onToggleNodeType: (nodeType: NodeType, show: boolean) => void;

  areaVisibility: Record<AreaType, boolean>;
  enabledAreaTypes: AreaType[];
  onToggleAreaType: (areaType: AreaType, show: boolean) => void;
}

export default function FilterMenu({
  lineVisibility,
  enabledLineTypes,
  onToggleLineType,
  nodeVisibility,
  enabledNodeTypes,
  onToggleNodeType,
  areaVisibility,
  enabledAreaTypes,
  onToggleAreaType,
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
      <DropdownMenuContent className="w-56 bg-white ml-4">
        <DropdownMenuLabel>{t('filters.mapElements')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Line types */}
        <div className="p-2 space-y-3">
          {enabledLineTypes.map((lineType) => {
            const config = lineConfig[lineType];
            const IconComponent = config.icon || Filter;
            const colorClass = config.colorClass || 'text-gray-600';
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
                  {t(`filters.${lineType}Lines`) || lineType}
                </label>
              </div>
            );
          })}
        </div>

        {/* Node types */}
        {enabledNodeTypes.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-3">
              {enabledNodeTypes.map((nodeType) => {
                const config = nodeConfig[nodeType];
                const IconComponent = config.icon || Filter;
                const colorClass = config.colorClass || 'text-gray-600';
                return (
                  <div key={nodeType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${nodeType}-nodes`}
                      checked={nodeVisibility[nodeType] || false}
                      onCheckedChange={(show) => onToggleNodeType(nodeType, !!show)}
                    />
                    <label
                      htmlFor={`${nodeType}-nodes`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <IconComponent size={16} className={colorClass} />
                      {t(`filters.${nodeType}Nodes`) || nodeType}
                    </label>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Area types */}
        {enabledAreaTypes.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-3">
              {enabledAreaTypes.map((areaType) => {
                const config = areaConfig[areaType];
                const IconComponent = config.icon || Filter;
                const colorClass = config.colorClass || 'text-gray-600';
                return (
                  <div key={areaType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${areaType}-areas`}
                      checked={areaVisibility[areaType] || false}
                      onCheckedChange={(show) => onToggleAreaType(areaType, !!show)}
                    />
                    <label
                      htmlFor={`${areaType}-areas`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <IconComponent size={16} className={colorClass} />
                      {t(`filters.${areaType}Areas`) || areaType}
                    </label>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}