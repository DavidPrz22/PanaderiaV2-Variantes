import { ArrowLeft, Edit, Trash2 } from "lucide-react";
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

interface LoteDetallesHeaderProps {
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    materiaPrimaNombre?: string;
}

export const LoteDetallesHeader = ({
    onClose,
    onEdit,
    onDelete,
    materiaPrimaNombre,
}: LoteDetallesHeaderProps) => {
    return (
        <div className="border-b">
            <div className="flex items-center justify-between p-6 w-4xl max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} title="Cerrar">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Detalles del Lote</h2>
                        <p className="text-sm text-muted-foreground font-medium">
                            {materiaPrimaNombre}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                        className="hidden sm:flex transition-all hover:bg-accent"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="transition-all hover:bg-destructive/90">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar este lote?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción eliminará el lote de forma permanente y actualizará el stock de la materia prima.
                                    Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onDelete}
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
};
