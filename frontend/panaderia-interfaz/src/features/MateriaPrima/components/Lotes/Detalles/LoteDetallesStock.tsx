interface LoteDetallesStockProps {
    stockActual: number;
    cantidadRecibida: number;
    unidadBase: string;
}

export const LoteDetallesStock = ({
    stockActual,
    cantidadRecibida,
    unidadBase,
}: LoteDetallesStockProps) => {
    return (
        <div className="space-y-4">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-widest">
                Información de Stock
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Stock Actual Lote</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">
                            {stockActual}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground uppercase">
                            {unidadBase}
                        </span>
                    </div>
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Cantidad Recibida</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">
                            {cantidadRecibida}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground uppercase">
                            {unidadBase}
                        </span>
                    </div>
                </div>
            </div>
            <div className="h-px bg-border/50 my-6" />
        </div>
    );
};
