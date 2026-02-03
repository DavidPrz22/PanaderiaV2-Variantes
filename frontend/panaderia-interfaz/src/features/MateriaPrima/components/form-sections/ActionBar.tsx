import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
    isPending: boolean;
    isDirty: boolean;
    updateRegistro: boolean;
}

export const ActionBar = ({ isPending, isDirty, updateRegistro }: ActionBarProps) => {
    return (
        <div className="pt-8 border-t bottom-0 bg-background/95 backdrop-blur-sm mt-auto">
            <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                disabled={isPending || !isDirty}
            >
                {isPending ? (
                    <>
                        <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Guardando Cambios...
                    </>
                ) : (
                    <>
                        <Save className="h-5 w-5 mr-2" />
                        {updateRegistro ? "Actualizar Materia Prima" : "Registrar Materia Prima"}
                    </>
                )}
            </Button>
        </div>
    );
};
