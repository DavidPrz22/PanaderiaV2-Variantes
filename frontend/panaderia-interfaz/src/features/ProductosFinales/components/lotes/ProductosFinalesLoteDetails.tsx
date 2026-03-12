import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/utils/use-toast";
import type { LotesProductosFinales } from "@/features/ProductosFinales/types/types";
import { LoteHeader } from "./details-sections/LoteHeader";
import { LoteInfoBadges } from "./details-sections/LoteInfoBadges";
import { LoteDates } from "./details-sections/LoteDates";
import { LoteStock } from "./details-sections/LoteStock";
import { LoteCosts } from "./details-sections/LoteCosts";
import { LoteMeasurements } from "./details-sections/LoteMeasurements";
import { LoteActions } from "./details-sections/LoteActions";

interface ProductosFinalesLoteDetailsProps {
  lote: LotesProductosFinales;
  onBack: () => void;
  onClose?: () => void;
  onToggleStatus?: (loteId: number) => void;
}

export const ProductosFinalesLoteDetails = ({
  lote,
  onBack,
  onClose,
  onToggleStatus,
}: ProductosFinalesLoteDetailsProps) => {
  const { toast } = useToast();

  const isActive = lote.estado !== "INACTIVO";

  const handleToggleActivo = () => {
    if (onToggleStatus) {
      onToggleStatus(lote.id);
      toast({
        title: isActive ? "Lote inactivado" : "Lote activado",
        description: isActive
          ? "El lote ha sido marcado como inactivo"
          : "El lote ha sido activado nuevamente",
      });
      onBack();
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      <LoteHeader
        produccionOrigen={lote.produccion_origen}
        onBack={onBack}
        onClose={onClose}
      />

      <ScrollArea className="flex-1">
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
          <LoteInfoBadges estado={lote.estado} isActive={isActive} />

          <Separator />

          <LoteDates
            fechaProduccion={lote.fecha_produccion}
            fechaCaducidad={lote.fecha_caducidad}
          />

          <Separator />

          <LoteStock
            cantidadInicial={lote.cantidad_inicial_lote}
            stockActual={lote.stock_actual_lote}
          />

          <Separator />

          <LoteCosts costoTotalUsd={lote.coste_total_lote_usd} />

          <Separator />

          <LoteMeasurements
            pesoTotalGramos={lote.peso_total_lote_gramos}
            volumenTotalMl={lote.volumen_total_lote_ml}
          />

          <Separator />

          <LoteActions
            isActive={isActive}
            onToggleStatus={onToggleStatus ? handleToggleActivo : undefined}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
