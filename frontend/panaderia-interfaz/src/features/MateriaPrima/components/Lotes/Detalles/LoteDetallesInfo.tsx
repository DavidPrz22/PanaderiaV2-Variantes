import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LoteDetallesInfoProps {
    loteId: number | undefined;
    estado: string;
}

const getStatusBadgeVariant = (estado: string) => {
    switch (estado.toUpperCase()) {
        case "DISPONIBLE":
            return "default";
        case "INACTIVO":
            return "secondary";
        case "AGOTADO":
            return "outline";
        case "EXPIRADO":
            return "destructive";
        default:
            return "secondary";
    }
};

export const LoteDetallesInfo = ({ loteId, estado }: LoteDetallesInfoProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                    <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                    Lote #{loteId}
                </h3>
            </div>
            <div className="flex items-center gap-2">
                <Badge
                    variant={getStatusBadgeVariant(estado)}
                    className="px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                >
                    {estado}
                </Badge>
            </div>
            <div className="h-px bg-border/50 my-6" />
        </div>
    );
};
