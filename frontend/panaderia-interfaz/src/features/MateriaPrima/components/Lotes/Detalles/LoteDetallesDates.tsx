import { Calendar } from "lucide-react";

interface LoteDetallesDatesProps {
    fechaRecepcion: string | Date;
    fechaCaducidad: string | Date;
}

export const LoteDetallesDates = ({
    fechaRecepcion,
    fechaCaducidad,
}: LoteDetallesDatesProps) => {
    return (
        <div className="space-y-4">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-widest">
                Fechas Clave
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground font-medium">Fecha de Recepción</span>
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{fechaRecepcion.toString()}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground font-medium">Fecha de Caducidad</span>
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Calendar className="h-4 w-4 text-destructive" />
                        <span>{fechaCaducidad.toString()}</span>
                    </div>
                </div>
            </div>
            <div className="h-px bg-border/50 my-6" />
        </div>
    );
};
