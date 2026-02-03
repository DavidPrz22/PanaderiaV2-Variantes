import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailsActionBarProps {
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}

export const DetailsActionBar = ({
    onClose,
    onEdit,
    onDelete,
    isDeleting,
}: DetailsActionBarProps) => {
    return (
        <div className="flex p-6 border-b ">
            <div className="flex justify-between items-center gap-4 w-4xl max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold">Detalles de Materia Prima</h2>
                        <p className="text-sm text-muted-foreground">
                            Información completa del registro
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onDelete}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                        <span className="text-destructive">Eliminar</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                    </Button>
                </div>
            </div>
        </div>
    );
};
