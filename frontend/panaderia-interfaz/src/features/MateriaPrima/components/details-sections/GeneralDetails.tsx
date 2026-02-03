import { Calendar } from "lucide-react";
import type { TMateriaPrima } from "../../schemas/zod-types";

interface GeneralDetailsProps {
    materiaprimaDetalles: TMateriaPrima;
}

export const GeneralDetails = ({ materiaprimaDetalles }: GeneralDetailsProps) => {
    return (
        <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Detalles Generales
            </h4>
            <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Unidad Base</span>
                    <span className="font-medium">
                        {materiaprimaDetalles.unidad_medida_base?.nombre_completo}
                    </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Categoría</span>
                    <span className="font-medium">
                        {materiaprimaDetalles.categoria?.nombre_categoria}
                    </span>
                </div>
                <div className="flex justify-between py-2 border-b items-center">
                    <span className="text-muted-foreground">Fecha Registro</span>
                    <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {materiaprimaDetalles.fecha_creacion_registro}
                    </span>
                </div>
            </div>
        </div>
    );
};
