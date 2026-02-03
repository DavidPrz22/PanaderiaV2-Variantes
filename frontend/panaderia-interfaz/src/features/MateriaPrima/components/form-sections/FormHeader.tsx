import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormHeaderProps {
    updateRegistro: boolean;
    onClose: () => void;
}

export const FormHeader = ({ updateRegistro, onClose }: FormHeaderProps) => {
    return (
        <div className="border-b">
            <div className="flex items-center gap-4 p-4 w-4xl max-w-4xl mx-auto">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" type="button">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">
                        {updateRegistro ? "Editar Materia Prima" : "Nueva Materia Prima"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {updateRegistro
                            ? "Actualice los detalles del registro"
                            : "Ingrese la información para el nuevo registro de inventario"}
                    </p>
                </div>
            </div>
        </div>
    );
};
