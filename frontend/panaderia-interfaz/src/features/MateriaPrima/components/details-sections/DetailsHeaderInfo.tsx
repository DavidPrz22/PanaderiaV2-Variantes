import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TMateriaPrima } from "../../schemas/zod-types";

interface DetailsHeaderInfoProps {
    materiaprimaDetalles: TMateriaPrima;
    categoriaNombre: string;
    isLowStock: boolean;
}

export const DetailsHeaderInfo = ({
    materiaprimaDetalles,
    categoriaNombre,
    isLowStock,
}: DetailsHeaderInfoProps) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">{materiaprimaDetalles.nombre}</h3>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="outline">
                    {categoriaNombre}
                </Badge>
                {isLowStock && (
                    <Badge variant="destructive">Stock Bajo</Badge>
                )}
                <Badge variant="outline">SKU: {materiaprimaDetalles.SKU}</Badge>
            </div>
            {materiaprimaDetalles.descripcion && (
                <p className="text-muted-foreground mt-2">
                    {materiaprimaDetalles.descripcion}
                </p>
            )}
        </div>
    );
};
