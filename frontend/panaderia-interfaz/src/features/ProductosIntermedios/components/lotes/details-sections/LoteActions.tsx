import { Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LoteActionsProps {
    isActive: boolean;
    onToggleStatus?: () => void;
}

export const LoteActions = ({ isActive, onToggleStatus }: LoteActionsProps) => {
    return (
        <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Acciones
            </h3>
            <div className="flex gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant={isActive ? "outline" : "default"}
                            className="flex-1"
                            disabled={!onToggleStatus}
                        >
                            {isActive ? (
                                <>
                                    <PowerOff className="h-4 w-4 mr-2" />
                                    Inactivar Lote
                                </>
                            ) : (
                                <>
                                    <Power className="h-4 w-4 mr-2" />
                                    Activar Lote
                                </>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isActive ? "¿Inactivar este lote?" : "¿Activar este lote?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {isActive
                                    ? "El lote quedará marcado como inactivo y no estará disponible para uso."
                                    : "El lote volverá a estar disponible para uso."}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onToggleStatus}>
                                {isActive ? "Inactivar" : "Activar"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};
