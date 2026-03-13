import { DetailsField } from "@/components/DetailsField";
import { DetailFieldValue } from "@/components/DetailFieldValue";
import { BorrarIcon, CheckIcon } from "@/assets/DashboardAssets";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { useChangeEstadoLoteProductosReventa } from "../hooks/mutations/productosReventaMutations";

export const PRLotesDetails = () => {
  const { lotesProductosReventaDetalles, setShowPRLotesDetalles, productoReventaId } = useProductosReventaContext();
  const { mutateAsync: changeEstadoLoteProductosReventa, isPending: isPendingChangeEstadoLoteProductosReventa } = useChangeEstadoLoteProductosReventa(productoReventaId);

  const handleChangeEstadoLote = async () => {
    if (lotesProductosReventaDetalles?.id) {
      await changeEstadoLoteProductosReventa(lotesProductosReventaDetalles.id);
      setShowPRLotesDetalles(false);
    }
  };
  if (!lotesProductosReventaDetalles) return null;

  return (
    <div className="flex items-center gap-20 relative">
      {isPendingChangeEstadoLoteProductosReventa && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      <div className="grid grid-rows-9 grid-cols-1 gap-2">
        <DetailsField extraClass="min-h-[20px] flex items-center">
          Id del lote
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          Fecha de recepción
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          Fecha de caducidad
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          Cantidad recibida
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          Stock actual del lote
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          Costo unitario del lote
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          Proveedor
        </DetailsField>
        <DetailsField extraClass="min-h-[20px] flex items-center">
          Estado del lote
        </DetailsField>

        {lotesProductosReventaDetalles.estado === "DISPONIBLE" && (
          <DetailsField extraClass="min-h-[40px] flex items-start">
            Inactivar lote
          </DetailsField>
        )}
        {lotesProductosReventaDetalles.estado === "INACTIVO" && (
          <DetailsField extraClass="min-h-[40px] flex items-center">
            Activar lote
          </DetailsField>
        )}
      </div>
      <div className="grid grid-rows-9 grid-cols-1 gap-2">
        <DetailFieldValue extraClass="min-h-[20px]">
          {lotesProductosReventaDetalles.id || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px]">
          {lotesProductosReventaDetalles.fecha_recepcion || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px]">
          {lotesProductosReventaDetalles.fecha_caducidad || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px]">
          {lotesProductosReventaDetalles.cantidad_recibida || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px]">
          {lotesProductosReventaDetalles.stock_actual_lote || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px]">
          ${lotesProductosReventaDetalles.coste_unitario_lote_usd || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px]">
          {lotesProductosReventaDetalles.proveedor?.nombre_proveedor || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[20px]">
          {lotesProductosReventaDetalles.estado || "-"}
        </DetailFieldValue>

        {lotesProductosReventaDetalles.estado === "DISPONIBLE" && (
          <DetailFieldValue extraClass="min-h-[40px]">
            <button
              onClick={handleChangeEstadoLote}
              className="bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 cursor-pointer ml-auto"
            >
              <img src={BorrarIcon} alt="Inactivar lote" className="size-6" />
            </button>
          </DetailFieldValue>
        )}
        {lotesProductosReventaDetalles.estado === "INACTIVO" && (
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