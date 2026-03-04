import { DetailsField } from "@/components/DetailsField";
import { DetailFieldValue } from "@/components/DetailFieldValue";
import { BorrarIcon, CheckIcon } from "@/assets/DashboardAssets";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { useChangeEstadoLoteProductosIntermedios } from "../hooks/mutations/productosIntermediosMutations";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
export const PILotesDetails = () => {
    const { mutateAsync: changeEstadoLoteProductosIntermedios, isPending: isPendingChangeEstadoLoteProductosIntermedios } = useChangeEstadoLoteProductosIntermedios();

    const handleChangeEstadoLote = async () => {
        await changeEstadoLoteProductosIntermedios(lotesProductosIntermediosDetalles!.id);
        setShowLotesDetalles(false);
    }

    const { lotesProductosIntermediosDetalles, setShowLotesDetalles} = useProductosIntermediosContext();
    if (!lotesProductosIntermediosDetalles) return null;

    const hasWeightMetrics = (
        lotesProductosIntermediosDetalles.peso_total_lote_gramos !== null ||
        lotesProductosIntermediosDetalles.peso_promedio_por_unidad !== null
    );
    const hasVolumeMetrics = (
        lotesProductosIntermediosDetalles.volumen_total_lote_ml !== null ||
        lotesProductosIntermediosDetalles.volumen_promedio_por_unidad !== null
    );

    // Prefer weight when both come populated; otherwise pick the one that exists
    const isWeightBased = hasWeightMetrics && !hasVolumeMetrics ? true : hasWeightMetrics && hasVolumeMetrics ? true : false;
    const isVolumeBased = !isWeightBased && hasVolumeMetrics;


  return (
    <div className="flex items-center gap-20">

      {isPendingChangeEstadoLoteProductosIntermedios && (
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
        { lotesProductosIntermediosDetalles.estado === "DISPONIBLE" && (
            <DetailsField extraClass="min-h-[40px] flex items-start ">
                Inactivar lote
            </DetailsField>
        )}
        { lotesProductosIntermediosDetalles.estado === "INACTIVO" && (
            <DetailsField extraClass="min-h-[40px] flex items-center">
                Activar lote
            </DetailsField>
        )}
      </div>
      <div className="grid grid-rows-9 grid-cols-1 gap-2">
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosIntermediosDetalles.id || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosIntermediosDetalles.fecha_produccion || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosIntermediosDetalles.fecha_caducidad || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosIntermediosDetalles.cantidad_inicial_lote || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosIntermediosDetalles.stock_actual_lote || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {Number(lotesProductosIntermediosDetalles.coste_total_lote_usd).toFixed(2) || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosIntermediosDetalles.estado || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px] ">
            {lotesProductosIntermediosDetalles.produccion_origen || "-"}
        </DetailFieldValue>

        {/* Peso */}
        {isWeightBased && (
          <>
            <DetailFieldValue extraClass="min-h-[20px] ">
              {lotesProductosIntermediosDetalles.peso_total_lote_gramos || "-"}
            </DetailFieldValue>
            <DetailFieldValue extraClass="min-h-[20px] ">
              {lotesProductosIntermediosDetalles.peso_promedio_por_unidad || "-"}
            </DetailFieldValue>
          </>
        )}

        {/* Volumen */}
        {isVolumeBased && (
          <>
            <DetailFieldValue extraClass="min-h-[20px] ">
              {lotesProductosIntermediosDetalles.volumen_total_lote_ml || "-"}
            </DetailFieldValue>
            <DetailFieldValue extraClass="min-h-[20px] ">
              {lotesProductosIntermediosDetalles.volumen_promedio_por_unidad || "-"}
            </DetailFieldValue>
          </>
        )}
            <DetailFieldValue extraClass="min-h-[20px] ">
          {lotesProductosIntermediosDetalles.costo_unitario_usd.toFixed(2) || "-"}
        </DetailFieldValue>

        { lotesProductosIntermediosDetalles.estado === "DISPONIBLE" && (
            <DetailFieldValue extraClass="min-h-[40px]">
            <button
                onClick={handleChangeEstadoLote}
                className="bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 cursor-pointer ml-auto"
            >
                <img src={BorrarIcon} alt="Inactivar lote" className="size-6" />
          </button>
            </DetailFieldValue>
        )}
        { lotesProductosIntermediosDetalles.estado === "INACTIVO" && (
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