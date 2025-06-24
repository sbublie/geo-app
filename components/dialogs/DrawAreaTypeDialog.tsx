import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import * as turf from "@turf/turf";

import { drawAreaTypes } from "@/lib/config/drawAreaTypes";
import { useTranslations } from "next-intl";

export default function DrawAreaTypeDialog({
  showAreaTypeDialog,
  setShowAreaTypeDialog,
  pendingPolygon,
  handleAreaTypeSelect,
}: {
  showAreaTypeDialog: boolean;
  setShowAreaTypeDialog: (open: boolean) => void;
  pendingPolygon: { points: [number, number][] } | null;
  handleAreaTypeSelect: (type: string) => void;
}) {
  const t = useTranslations();
  const [selectedType, setSelectedType] = useState<string>("");

  // Reset selected type when dialog opens
  useEffect(() => {
    if (showAreaTypeDialog) {
      setSelectedType("");
    }
  }, [showAreaTypeDialog]);

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    handleAreaTypeSelect(type);
  };

  const calculateArea = () => {
    if (!pendingPolygon) return "";

    const closedPoints = [...pendingPolygon.points, pendingPolygon.points[0]];
    const polygonData = {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [closedPoints],
      },
      properties: {},
    };
    const area = turf.area(polygonData);
    const areaInKm2 = area / 1000000;
    return areaInKm2 < 0.01
      ? `${Math.round(area)} m²`
      : `${areaInKm2.toFixed(2)} km²`;
  };

  return (
    <Dialog open={showAreaTypeDialog} onOpenChange={setShowAreaTypeDialog}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t("areas.selectType")}</DialogTitle>
          <DialogDescription>{t("areas.selectDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Area Information Card */}
          {pendingPolygon && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t("areas.polygonArea")}:
              </span>
              <Badge variant="secondary" className="font-mono">
                {calculateArea()}
              </Badge>
            </div>
          )}

          <Separator />

          {/* Type Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t("areas.polygonType")}</h4>

            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-2 space-y-1">
                {drawAreaTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? "default" : "ghost"}
                    className={`
                                            w-full justify-start h-auto p-3 text-left transition-all duration-200
                                            ${
                                              selectedType === type.value
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-accent hover:text-accent-foreground"
                                            }
                                        `}
                    onClick={() => handleSelectType(type.value)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-background shadow-sm flex-shrink-0"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm font-medium truncate">
                        {t(`${type.labelKey}`) || type.labelKey}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
