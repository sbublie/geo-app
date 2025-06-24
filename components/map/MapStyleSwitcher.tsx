'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Map } from 'lucide-react';
import { useTranslations } from 'next-intl';

const MAP_STYLES = [
	{
		id: 'streets',
		style: 'mapbox://styles/mapbox/streets-v12',
	},
	{
		id: 'satellite',
		style: 'mapbox://styles/mapbox/satellite-v9',
	},
	{
		id: 'light',
		style: 'mapbox://styles/mapbox/light-v11',
	},
	{
		id: 'dark',
		style: 'mapbox://styles/mapbox/dark-v11',
	},
	{
		id: 'outdoors',
		style: 'mapbox://styles/mapbox/outdoors-v12',
	},
	{
		id: 'monochrome',
		style: 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g',
	},
	{
		id: 'pencil',
		style: 'mapbox://styles/mapbox/cj44mfrt20f082snokim4ungi',
	},
];

interface MapStyleSwitcherProps {
	currentStyle: string;
	onChange: (style: string) => void;
}

export default function MapStyleSwitcher({
	currentStyle,
	onChange,
}: MapStyleSwitcherProps) {

    const t = useTranslations('map');
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="bg-white shadow-lg border flex items-center gap-2"
				>
					<Map size={16} />
					{t('title')}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-44 bg-white ml-4">
				<DropdownMenuLabel>{t('styles.title')}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<div className="py-1">
					{MAP_STYLES.map((style) => (
						<Button
							key={style.id}
							variant={
								currentStyle === style.style ? 'default' : 'ghost'
							}
							size="sm"
							className={`w-full justify-start text-left ${
								currentStyle === style.style ? 'bg-blue-600 text-white' : ''
							}`}
							onClick={() => onChange(style.style)}
						>
							{t(`styles.${style.id}`)}
						</Button>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}