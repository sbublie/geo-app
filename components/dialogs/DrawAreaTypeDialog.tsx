import React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as turf from '@turf/turf';

import { drawAreaTypes } from '@/lib/config/drawAreaTypes';
import { useTranslations } from 'next-intl';

export default function DrawAreaTypeDialog({
    showAreaTypeDialog,
    setShowAreaTypeDialog,
    pendingPolygon,
    handleAreaTypeSelect
}: {
    showAreaTypeDialog: boolean;
    setShowAreaTypeDialog: (open: boolean) => void;
    pendingPolygon: { points: [number, number][] } | null;
    handleAreaTypeSelect: (type: string) => void;
}) {
    const t = useTranslations();
    const [selectedType, setSelectedType] = useState<string>('');

    // Reset selected type when dialog opens
    useEffect(() => {
        if (showAreaTypeDialog) {
            setSelectedType('');
        }
    }, [showAreaTypeDialog]);

    const handleSelectType = (type: string) => {
        setSelectedType(type);
        handleAreaTypeSelect(type);
    };

    return (
        <Dialog open={showAreaTypeDialog} onOpenChange={setShowAreaTypeDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{t("areas.selectType")}</DialogTitle>
                    <DialogDescription>
                        {t("areas.selectDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {pendingPolygon && (
                        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg">
                            <strong>{t("areas.polygonArea")}</strong> {(() => {
                                const closedPoints = [...pendingPolygon.points, pendingPolygon.points[0]];
                                const polygonData = {
                                    type: 'Feature' as const,
                                    geometry: {
                                        type: 'Polygon' as const,
                                        coordinates: [closedPoints]
                                    },
                                    properties: {}
                                };
                                const area = turf.area(polygonData);
                                const areaInKm2 = area / 1000000;
                                return areaInKm2 < 0.01
                                    ? `${Math.round(area)} m²`
                                    : `${areaInKm2.toFixed(2)} km²`;
                            })()}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("areas.polygonType")}</label>
                        <div className="border rounded-lg p-2 max-h-[300px] overflow-y-auto">
                            <div className="grid gap-1">
                                {drawAreaTypes.map((type) => (
                                    <Button
                                        key={type.value}
                                        variant={selectedType === type.value ? "default" : "ghost"}
                                        className={`
                                            justify-start h-auto p-3 text-left cursor-pointer transition-all duration-200
                                            ${selectedType === type.value 
                                                ? 'bg-blue-100 border-blue-300 border shadow-sm' 
                                                : 'hover:bg-gray-100 hover:shadow-sm hover:border-gray-200 border border-transparent'
                                            }
                                        `}
                                        onClick={() => handleSelectType(type.value)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <div
                                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-200 hover:scale-110"
                                                style={{ backgroundColor: type.color }}
                                            ></div>
                                            <span className="text-sm font-medium transition-colors duration-200">
                                                {t(`${type.labelKey}`)|| ""} 
                                            </span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
