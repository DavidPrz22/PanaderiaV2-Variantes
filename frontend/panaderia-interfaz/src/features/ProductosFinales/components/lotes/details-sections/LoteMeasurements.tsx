import { Ruler } from "lucide-react";

interface LoteMeasurementsProps {
    pesoTotalGramos: string | number | null;
    volumenTotalMl: string | number | null;
}

export const LoteMeasurements = ({ pesoTotalGramos, volumenTotalMl }: LoteMeasurementsProps) => {
    if (!pesoTotalGramos && !volumenTotalMl) return null;

    return (
        <div className="grid grid-cols-2 gap-6">
            {pesoTotalGramos && (
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                        <Ruler className="h-3 w-3" /> Peso Total
                    </p>
                    <p className="font-semibold">{pesoTotalGramos} g</p>
                </div>
            )}
            {volumenTotalMl && (
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                        <Ruler className="h-3 w-3" /> Volumen Total
                    </p>
                    <p className="font-semibold">{volumenTotalMl} ml</p>
                </div>
            )}
        </div>
    );
};
