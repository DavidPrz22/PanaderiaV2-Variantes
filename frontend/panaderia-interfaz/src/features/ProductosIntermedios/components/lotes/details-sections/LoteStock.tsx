interface LoteStockProps {
    cantidadInicial: number;
    stockActual: number;
}

export const LoteStock = ({ cantidadInicial, stockActual }: LoteStockProps) => {
    return (
        <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Stock
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Cantidad Inicial</p>
                    <p className="font-medium">{cantidadInicial}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Stock Actual</p>
                    <p className={`font-medium ${stockActual === 0 ? "text-muted-foreground" : ""}`}>
                        {stockActual}
                    </p>
                </div>
            </div>
        </div>
    );
};
