import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoteHeaderProps {
    produccionOrigen: string | number;
    onBack: () => void;
    onClose?: () => void;
}

export const LoteHeader = ({ produccionOrigen, onBack, onClose }: LoteHeaderProps) => {
    return (
        <div className="flex items-center gap-4 p-6 border-b">
            <Button variant="ghost" size="icon" onClick={onClose || onBack}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
                <h2 className="text-xl font-semibold">Detalle del Lote</h2>
                <p className="text-sm text-muted-foreground">
                    Producción: {produccionOrigen}
                </p>
            </div>
        </div>
    );
};
