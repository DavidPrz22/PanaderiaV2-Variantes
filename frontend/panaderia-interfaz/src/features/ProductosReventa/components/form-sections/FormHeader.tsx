import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FormHeaderProps {
  onClose: () => void;
  updateRegistro: boolean;
}

export const FormHeader = ({ onClose, updateRegistro }: FormHeaderProps) => {
  return (
    <div className="border-b font-[Roboto]">
            <div className="flex items-center gap-4 pb-4 w-4xl max-w-4xl mx-auto">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" type="button">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">
                        {updateRegistro ? "Editar Producto de Reventa" : "Nuevo Producto de Reventa"}
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
