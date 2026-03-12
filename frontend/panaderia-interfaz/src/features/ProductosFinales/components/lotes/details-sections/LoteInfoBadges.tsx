import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant } from "@/utils/utils";

interface LoteInfoBadgesProps {
    estado: string;
    isActive: boolean;
}

export const LoteInfoBadges = ({ estado, isActive }: LoteInfoBadgesProps) => {
    return (
        <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusBadgeVariant(estado as any)}>{estado}</Badge>
            {isActive ? (
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                    Activo
                </Badge>
            ) : (
                <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">
                    Inactivo
                </Badge>
            )}
        </div>
    );
};
