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
import { Filter, Train, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FilterMenuProps {
  showTrainLines: boolean;
  showPowerLines: boolean;
  onToggleTrainLines: (show: boolean) => void;
  onTogglePowerLines: (show: boolean) => void;
}

export default function FilterMenu({
  showTrainLines,
  showPowerLines,
  onToggleTrainLines,
  onTogglePowerLines,
}: FilterMenuProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white  shadow-lg border flex items-center gap-2"
        >
          <Filter size={16} />
          {t('filters.title')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white ml-8">
        <DropdownMenuLabel>{t('filters.mapElements')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-3">
          {/* Train Lines Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="train-lines"
              checked={showTrainLines}
              onCheckedChange={onToggleTrainLines}
            />
            <label
              htmlFor="train-lines"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
            >
              <Train size={16} className="text-blue-600" />
              {t('filters.trainLines')}
            </label>
          </div>

          {/* Power Lines Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="power-lines"
              checked={showPowerLines}
              onCheckedChange={onTogglePowerLines}
            />
            <label
              htmlFor="power-lines"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
            >
              <Zap size={16} className="text-red-600" />
              {t('filters.powerLines')}
            </label>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}