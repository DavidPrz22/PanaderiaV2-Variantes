import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
    isSubmitting?: boolean;
    onCancel: () => void;
}

export const ActionBar = ({ isSubmitting = false, onCancel }: ActionBarProps) => {
    return (
        <div className="pt-4 flex gap-3 sticky bottom-0 bg-background p-4 border-t mt-auto">
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
                disabled={isSubmitting}
            >
                Cancelar
            </Button>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Guardando..." : "Guardar Producto"}
            </Button>
        </div>
    );
};
