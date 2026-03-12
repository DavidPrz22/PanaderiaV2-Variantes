import { Package } from "lucide-react";

interface LoteStockProps {
    cantidadInicial: string | number;
    stockActual: string | number;
}

export const LoteStock = ({ cantidadInicial, stockActual }: LoteStockProps) => {
    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Package className="h-3 w-3" /> Cantidad Inicial
                </p>
                <p className="font-semibold text-lg">{cantidadInicial}</p>
            </div>
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Package className="h-3 w-3" /> Stock Actual
                </p>
                <p className="font-semibold text-lg text-primary">{stockActual}</p>
            </div>
        </div>
    );
};
