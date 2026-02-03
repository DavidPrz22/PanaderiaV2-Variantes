import { Button } from "@/components/ui/button";
import { Power, PowerOff, Loader2, AlertCircle } from "lucide-react";
import { useUpdateLoteStatusMateriaPrimaMutation } from "../../hooks/mutations/materiaPrimaMutations";
import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";
import { toast } from "sonner";

interface LoteDetallesActionsProps {
    loteId: number;
    estado: string;
}

export const LoteDetallesActions = ({
    loteId,
    estado,
}: LoteDetallesActionsProps) => {
    const { materiaprimaId, setViewMode } = useMateriaPrimaContext();

    const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateLoteStatusMateriaPrimaMutation(
        materiaprimaId!
    );

    const isInactive = estado === "INACTIVO";
    const isActive = estado === "DISPONIBLE";
    const isExpired = estado === "EXPIRADO";

    const handleToggleStatus = async () => {
        try {
            const action = isInactive ? "ACTIVAR" : "INACTIVAR";
            await updateStatus({ id: loteId, action });
            toast.success(`Lote ${isInactive ? "activado" : "inactivado"} correctamente`);
            setViewMode("details");
        } catch (error) {
            toast.error("Error al cambiar el estado del lote");
        }
    };

    return (
        <div className="flex flex-col gap-6 pt-8 border-t border-border/60 mt-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    Gestión de Inventario
                </h3>
            </div>

            <div className="space-y-4">
                {/* Primary Toggle Action */}
                {isActive || isInactive ? (
                    <Button
                        variant={isInactive ? "default" : "outline"}
                        className={`h-14 w-full text-base font-bold transition-all duration-300 shadow-lg border-2 relative overflow-hidden group cursor-pointer ${isInactive
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-500/20"
                            : "bg-amber-50/50 hover:bg-amber-100/80 text-amber-700 border-amber-200 shadow-amber-200/20"
                            }`}
                        onClick={handleToggleStatus}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        ) : isInactive ? (
                            <Power className="h-5 w-5 mr-3 scale-110 group-hover:rotate-12 transition-transform" />
                        ) : (
                            <PowerOff className="h-5 w-5 mr-3 scale-110 group-hover:-rotate-12 transition-transform" />
                        )}
                        {isInactive ? "ACTIVAR LOTE PARA USO" : "INACTIVAR LOTE TEMPORALMENTE"}
                    </Button>
                ) : (
                    <div className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 font-bold text-sm shadow-sm ${isExpired
                        ? "bg-destructive/5 border-destructive/20 text-destructive"
                        : "bg-muted border-border text-muted-foreground"
                        }`}>
                        <AlertCircle className="h-5 w-5" />
                        {isExpired ? "LOTE EXPIRADO - NO SE PUEDE ACTIVAR" : "LOTE AGOTADO"}
                    </div>
                )}

            </div>
        </div>
    );
};
