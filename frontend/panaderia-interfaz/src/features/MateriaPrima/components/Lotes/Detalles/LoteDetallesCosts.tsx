import { DollarSign, Wallet } from "lucide-react";

interface LoteDetallesCostsProps {
    costoUnitarioDivisa: string | number;
    costoUnitarioLocal: string | number;
}

export const LoteDetallesCosts = ({
    costoUnitarioDivisa,
    costoUnitarioLocal,
}: LoteDetallesCostsProps) => {
    return (
        <div className="space-y-4">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-widest">
                Información de Costos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-primary/5 border  rounded-xl p-5 shadow-sm">
                    <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                        <DollarSign className="h-3.5 w-3.5" />
                        Costo Unitario Divisa
                    </p>
                    <p className="text-3xl font-bold text-primary">
                        ${costoUnitarioDivisa}
                    </p>
                </div>
                <div className="bg-muted/10 border border-border/50 rounded-xl p-5 shadow-sm">
                    <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                        <Wallet className="h-3.5 w-3.5" />
                        Costo Unitario Local
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {costoUnitarioLocal}
                    </p>
                </div>
            </div>
        </div>
    );
};
