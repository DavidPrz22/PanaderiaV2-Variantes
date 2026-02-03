import type { TLoteMateriaPrima } from "../../../schemas/zod-types";

interface LoteDetallesVarianteProps {
    variante: TLoteMateriaPrima["variante_materia_prima"];
}

export const LoteDetallesVariante = ({ variante }: LoteDetallesVarianteProps) => {
    return (
        <div className="space-y-4">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-widest">
                Variante Seleccionada
            </h4>
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Nombre de la Variante</span>
                    <span className="text-lg font-bold text-foreground">
                        {variante.nombre_variante}
                    </span>
                </div>
            </div>
            <div className="h-px bg-border/50 my-6" />
        </div>
    );
};
