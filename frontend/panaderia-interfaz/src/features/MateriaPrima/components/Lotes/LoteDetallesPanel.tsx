import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";
import type { TLoteMateriaPrima } from "../../schemas/zod-types";
import { useDeleteLoteMateriaPrimaMutation } from "../../hooks/mutations/materiaPrimaMutations";
import { useMateriaPrimaDetallesQuery } from "../../hooks/queries/materiaPrimaqueries";
import { LoteDetallesHeader } from "./Detalles/LoteDetallesHeader";
import { LoteDetallesInfo } from "./Detalles/LoteDetallesInfo";
import { LoteDetallesStock } from "./Detalles/LoteDetallesStock";
import { LoteDetallesDates } from "./Detalles/LoteDetallesDates";
import { LoteDetallesProveedor } from "./Detalles/LoteDetallesProveedor";
import { LoteDetallesVariante } from "./Detalles/LoteDetallesVariante";
import { LoteDetallesCosts } from "./Detalles/LoteDetallesCosts";
import { LoteDetallesActions } from "./LoteDetallesActions";

interface LoteDetailsPanelProps {
  lote: TLoteMateriaPrima;
  onClose: () => void;
  onEdit: () => void;
  onDeleteSuccess: () => void;
}

export const LoteDetailsPanel = ({
  lote,
  onClose,
  onEdit,
  onDeleteSuccess,
}: LoteDetailsPanelProps) => {
  const { materiaprimaId } = useMateriaPrimaContext();
  const { data: materiaprimaDetalles } = useMateriaPrimaDetallesQuery(materiaprimaId!);

  const { mutateAsync: deleteLoteMateriaPrima } = useDeleteLoteMateriaPrimaMutation(materiaprimaDetalles?.id!);

  const handleDelete = async () => {
    if (lote.id) {
      await deleteLoteMateriaPrima(lote.id);
      onDeleteSuccess();
    }
  };

  const unidadBase = materiaprimaDetalles?.unidad_medida_base?.abreviatura || "";

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header Section */}
      <LoteDetallesHeader
        onClose={onClose}
        onEdit={onEdit}
        onDelete={handleDelete}
        materiaPrimaNombre={materiaprimaDetalles?.nombre}
      />

      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {/* Header Info Section (ID & Status) */}
          <LoteDetallesInfo
            loteId={lote.id}
            estado={lote.estado}
          />

          {/* Stock Information Section */}
          <LoteDetallesStock
            stockActual={lote.stock_actual_lote}
            cantidadRecibida={lote.cantidad_recibida}
            unidadBase={unidadBase}
          />

          {/* Dates Section */}
          <LoteDetallesDates
            fechaRecepcion={lote.fecha_recepcion}
            fechaCaducidad={lote.fecha_caducidad}
          />

          {/* Proveedor Section */}
          <LoteDetallesProveedor proveedor={lote.proveedor} />

          {/* Variante Section */}
          <LoteDetallesVariante variante={lote.variante_materia_prima} />

          {/* Costs Section */}
          <LoteDetallesCosts
            costoUnitarioDivisa={lote.costo_unitario_divisa}
            costoUnitarioLocal={lote.costo_unitario_local}
          />

          <LoteDetallesActions
            loteId={lote.id}
            estado={lote.estado}
          />
        </div>
      </div>
    </div>
  );
};

