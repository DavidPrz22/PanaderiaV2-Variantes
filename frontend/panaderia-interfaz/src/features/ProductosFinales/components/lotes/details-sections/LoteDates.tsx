import { Calendar } from "lucide-react";

interface LoteDatesProps {
    fechaProduccion: string;
    fechaCaducidad: string;
}

export const LoteDates = ({ fechaProduccion, fechaCaducidad }: LoteDatesProps) => {
    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Fecha Producción
                </p>
                <p className="font-semibold">{fechaProduccion}</p>
            </div>
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Fecha Caducidad
                </p>
                <p className="font-semibold">{fechaCaducidad}</p>
            </div>
        </div>
    );
};
