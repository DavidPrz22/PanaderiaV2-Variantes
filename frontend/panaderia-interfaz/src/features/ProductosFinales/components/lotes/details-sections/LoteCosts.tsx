import { DollarSign } from "lucide-react";

interface LoteCostsProps {
    costoTotalUsd: string | number;
}

export const LoteCosts = ({ costoTotalUsd }: LoteCostsProps) => {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                <DollarSign className="h-3 w-3" /> Costo Total
            </p>
            <p className="font-semibold text-xl text-emerald-600">
                ${Number(costoTotalUsd).toFixed(2)}
            </p>
        </div>
    );
};
