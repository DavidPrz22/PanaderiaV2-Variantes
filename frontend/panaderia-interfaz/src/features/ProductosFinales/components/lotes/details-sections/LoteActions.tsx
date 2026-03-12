import { Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoteActionsProps {
    isActive: boolean;
    onToggleStatus?: () => void;
}

export const LoteActions = ({ isActive, onToggleStatus }: LoteActionsProps) => {
    if (!onToggleStatus) return null;

    return (
        <div className="flex flex-col gap-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Acciones
            </h4>
            <Button
                variant={isActive ? "destructive" : "default"}
                className="w-full justify-start gap-2"
                onClick={onToggleStatus}
            >
                {isActive ? (
                    <>
                        <PowerOff className="h-4 w-4" /> Inactivar Lote
                    </>
                ) : (
                    <>
                        <Power className="h-4 w-4" /> Activar Lote
                    </>
                )}
            </Button>
        </div>
    );
};
