import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
    isSubmitting?: boolean;
    onCancel: () => void;
    formId?: string;
}

export const ActionBar = ({ isSubmitting = false, onCancel, formId }: ActionBarProps) => {
    return (
        <div className="pt-4 bottom-0 bg-background p-4 border-t ">
            <div className="flex gap-3 items-center max-w-4xl mx-auto">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button type="submit" form={formId} disabled={isSubmitting} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Guardando..." : "Guardar Producto"}
                </Button>
            </div>
        </div>
    );
};
