import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant } from "@/utils/utils";

interface LoteInfoBadgesProps {
    estado: string;
    isActive: boolean;
}

export const LoteInfoBadges = ({ estado, isActive }: LoteInfoBadgesProps) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(estado)}>
                    {estado}
                </Badge>
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            </div>
        </div>
    );
};
