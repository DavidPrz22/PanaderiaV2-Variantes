import type { TLoteMateriaPrima } from "../../../schemas/zod-types";

interface LoteDetallesProveedorProps {
    proveedor: TLoteMateriaPrima["proveedor"];
}

export const LoteDetallesProveedor = ({ proveedor }: LoteDetallesProveedorProps) => {
    return (
        <div className="space-y-4">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-widest">
                Información del Proveedor
            </h4>
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Nombre del Proveedor</span>
                    <span className="text-lg font-bold text-foreground">
                        {proveedor.nombre_comercial || `${proveedor.nombre_proveedor} ${proveedor.apellido_proveedor}`}
                    </span>
                </div>
            </div>
            <div className="h-px bg-border/50 my-6" />
        </div>
    );
};
