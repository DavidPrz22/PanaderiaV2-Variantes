import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompraLineaRow } from "./ComprasLineaRow";
import type { DetalleOC } from "../types/types";

interface ComprasProductsTableProps {
  items: DetalleOC[];
  moneda: "USD" | "Bs";
  tasaCambio: number;
  onUpdateLinea: (index: number, linea: DetalleOC) => void;
  onRemoveLinea: (id: number) => void;
  onAddLinea: () => void;
}

export const ComprasProductsTable = ({
  items,
  moneda,
  tasaCambio,
  onUpdateLinea,
  onRemoveLinea,
  onAddLinea,
}: ComprasProductsTableProps) => {
  return (
    <div>
      <div className="border border-border rounded-lg overflow-hidden bg-white dark:bg-card shadow-sm">
        {/* Column headers */}
        <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border">
          <div className="col-span-3">Producto</div>
          <div className="col-span-2">Modo compra</div>
          <div className="col-span-2">Unidad</div>
          <div className="col-span-1 text-center">Cant.</div>
          <div className="col-span-2">Precio Unit.</div>
          <div className="col-span-2 text-right">Subtotal</div>
        </div>

        {/* Lines */}
        <div className="min-h-[100px]">
          {items.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No hay productos en esta orden. Haz clic en "Agregar línea" para comenzar.
            </div>
          ) : (
            items.map((linea, index) => (
              <CompraLineaRow
                key={linea.id || index}
                linea={linea}
                moneda={moneda}
                tasaCambio={tasaCambio}
                onChange={(data) => onUpdateLinea(index, data)}
                onRemove={() => onRemoveLinea(linea.id)}
                autoFocus={index === items.length - 1 && items.length > 1}
              />
            ))
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onAddLinea}
        className="w-full mt-3 border-dashed gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
      >
        <Plus className="h-4 w-4" />
        Agregar línea de producto
      </Button>
    </div>
  );
};