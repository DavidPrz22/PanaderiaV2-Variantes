import type { TMateriaPrima } from "../../schemas/zod-types";

interface StockInformationProps {
    materiaprimaDetalles: TMateriaPrima;
    isLowStock: boolean;
}

export const StockInformation = ({
    materiaprimaDetalles,
    isLowStock,
}: StockInformationProps) => {
    return (
        <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Información de Stock
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Stock Actual</p>
                    <p className={`text-3xl font-bold ${isLowStock ? "text-destructive" : ""}`}>
                        {materiaprimaDetalles.stock_actual}
                        <span className="text-base font-normal text-muted-foreground ml-1">
                            {materiaprimaDetalles.unidad_medida_base?.abreviatura}
                        </span>
                    </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Punto Reorden</p>
                    <p className="text-3xl font-bold">
                        {materiaprimaDetalles.punto_reorden}
                        <span className="text-base font-normal text-muted-foreground ml-1">
                            {materiaprimaDetalles.unidad_medida_base?.abreviatura}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
