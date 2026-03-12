import { DetailsField } from "@/components/DetailsField";
import { DetailFieldValue } from "@/components/DetailFieldValue";
import { BorrarIcon, CheckIcon } from "@/assets/DashboardAssets";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";
import { useChangeEstadoLoteProductosFinales } from "../hooks/mutations/productosFinalesMutations";
import { PendingTubeSpinner } from "./PendingTubeSpinner";

export const PFLotesDetails = () => {
    const { mutateAsync: changeEstadoLoteProductosFinales, isPending: isPendingChangeEstadoLoteProductosFinales } = useChangeEstadoLoteProductosFinales();

    const handleChangeEstadoLote = async () => {
        await changeEstadoLoteProductosFinales(lotesProductosFinalesDetalles!.id);
        setShowLotesDetalles(false);
    }

    const { lotesProductosFinalesDetalles, setShowLotesDetalles} = useProductosFinalesContext();
    if (!lotesProductosFinalesDetalles) return null;

    const hasWeightMetrics = (
        lotesProductosFinalesDetalles.peso_total_lote_gramos !== null ||
        lotesProductosFinalesDetalles.peso_promedio_por_unidad !== null
    );
    const hasVolumeMetrics = (
        lotesProductosFinalesDetalles.volumen_total_lote_ml !== null ||
        lotesProductosFinalesDetalles.volumen_promedio_por_unidad !== null
    );

    // Prefer weight when both come populated; otherwise pick the one that exists
    const isWeightBased = hasWeightMetrics && !hasVolumeMetrics ? true : hasWeightMetrics && hasVolumeMetrics ? true : false;
    const isVolumeBased = !isWeightBased && hasVolumeMetrics;


  return (
    <div className="flex items-center gap-20">
    
      {isPendingChangeEstadoLoteProductosFinales && (
        <PendingTubeSpinner size={28} extraClass="bg-white absolute opacity-50 w-full h-full" />
      )}

      <div className="grid grid-rows-9 grid-cols-1 gap-2">
        <DetailsField extraClass="min-h-[20px] flex items-center">
          Id del lote
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          fecha de produccion
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          fecha de caducidad
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          cantidad inicial del lote
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          stock actual del lote
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          coste total del lote
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          estado del lote
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          produccion origen
        </DetailsField>

        {/* Peso */}
        {isWeightBased && (
          <>
            <DetailsField extraClass="min-h-[20px] flex items-center">
              peso total del lote
            </DetailsField>
            <DetailsField extraClass="min-h-[20px] flex items-center">
              peso promedio por unidad
            </DetailsField>
          </>
        )}

        {/* Volumen */}
        {isVolumeBased && (
          <>
            <DetailsField extraClass="min-h-[20px] flex items-center">
              volumen total del lote
            </DetailsField>
            <DetailsField extraClass="min-h-[20px] flex items-center">
              volumen promedio por unidad
            </DetailsField>
          </>
        )}

        <DetailsField extraClass="min-h-[20px] flex items-center">
          costo unitario del lote
        </DetailsField>
        { lotesProductosFinalesDetalles.estado === "DISPONIBLE" && (
            <DetailsField extraClass="min-h-[40px] flex items-start ">
                Inactivar lote
            </DetailsField>
        )}
        { lotesProductosFinalesDetalles.estado === "INACTIVO" && (
            <DetailsField extraClass="min-h-[40px] flex items-center">
                Activar lote
            </DetailsField>
        )}
      </div>
      <div className="grid grid-rows-9 grid-cols-1 gap-2">
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosFinalesDetalles.id || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosFinalesDetalles.fecha_produccion || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosFinalesDetalles.fecha_caducidad || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosFinalesDetalles.cantidad_inicial_lote || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosFinalesDetalles.stock_actual_lote || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosFinalesDetalles.coste_total_lote_usd || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosFinalesDetalles.estado || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
            {lotesProductosFinalesDetalles.produccion_origen || "-"}
        </DetailFieldValue>

        {/* Peso */}
        {isWeightBased && (
          <>
            <DetailFieldValue extraClass="min-h-[20px] ">
              {lotesProductosFinalesDetalles.peso_total_lote_gramos || "-"}
            </DetailFieldValue>
            <DetailFieldValue extraClass="min-h-[20px] ">
              {lotesProductosFinalesDetalles.peso_promedio_por_unidad || "-"}
            </DetailFieldValue>
          </>
        )}

        {/* Volumen */}
        {isVolumeBased && (
          <>
            <DetailFieldValue extraClass="min-h-[20px] ">
              {lotesProductosFinalesDetalles.volumen_total_lote_ml || "-"}
            </DetailFieldValue>
            <DetailFieldValue extraClass="min-h-[20px] ">
              {lotesProductosFinalesDetalles.volumen_promedio_por_unidad || "-"}
            </DetailFieldValue>
          </>
        )}
            <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosFinalesDetalles.costo_unitario_usd || "-"}
        </DetailFieldValue>

        { lotesProductosFinalesDetalles.estado === "DISPONIBLE" && (
            <DetailFieldValue extraClass="min-h-[40px]">
            <button
                onClick={handleChangeEstadoLote}
                className="bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 cursor-pointer ml-auto"
            >
                <img src={BorrarIcon} alt="Inactivar lote" className="size-6" />
          </button>
            </DetailFieldValue>
        )}
        { lotesProductosFinalesDetalles.estado === "INACTIVO" && (
            <DetailFieldValue extraClass="min-h-[40px]">
            <button
                onClick={handleChangeEstadoLote}
                className="bg-green-500 text-white p-1.5 rounded-md hover:bg-green-600 cursor-pointer ml-auto"
            >
                <img src={CheckIcon} alt="Activar lote" className="size-6" />
          </button>
            </DetailFieldValue>
        )}
      </div>
    </div>
  );
};
