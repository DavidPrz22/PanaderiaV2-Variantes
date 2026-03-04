interface LoteCostsProps {
    costoTotalUsd: string | number;
}

export const LoteCosts = ({ costoTotalUsd }: LoteCostsProps) => {
    return (
        <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Costos
            </h3>
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Costo Total Lote (USD)</p>
                    <p className="font-medium text-lg">${Number(costoTotalUsd).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};
