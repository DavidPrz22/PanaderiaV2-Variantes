import { DetailsField } from "@/components/DetailsField";
import { DetailFieldValue } from "@/components/DetailFieldValue";
import { BorrarIcon, CheckIcon } from "@/assets/DashboardAssets";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { useChangeEstadoLoteProductosReventa } from "../../hooks/mutations/productosReventaMutations";

export const ProductosReventaLoteDetails = () => {
  const { 
    lotesProductosReventaDetalles, 
    setShowPRLotesDetalles, 
    productoReventaId 
  } = useProductosReventaContext();
  
  const { 
    mutateAsync: changeEstadoLote, 
    isPending 
  } = useChangeEstadoLoteProductosReventa(productoReventaId);

  const handleChangeEstadoLote = async () => {
    if (lotesProductosReventaDetalles?.id) {
      await changeEstadoLote(lotesProductosReventaDetalles.id);
      setShowPRLotesDetalles(false);
    }
  };

  if (!lotesProductosReventaDetalles) return null;

  return (
    <div className="flex items-start gap-12 relative p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {isPending && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-2xl">
        <div className="space-y-3">
          <DetailsField>Id del lote</DetailsField>
          <DetailsField>Variante de producto</DetailsField>
          <DetailsField>Fecha de recepción</DetailsField>
          <DetailsField>Fecha de caducidad</DetailsField>
          <DetailsField>Cantidad recibida</DetailsField>
          <DetailsField>Stock actual del lote</DetailsField>
          <DetailsField>Costo unitario</DetailsField>
          <DetailsField>Proveedor</DetailsField>
          <DetailsField>Estado</DetailsField>
        </div>

        <div className="space-y-3">
          <DetailFieldValue>{lotesProductosReventaDetalles.id || "-"}</DetailFieldValue>
          <DetailFieldValue>{lotesProductosReventaDetalles.producto_reventa_variante_detalles?.nombre_variante || "-"}</DetailFieldValue>
          <DetailFieldValue>{lotesProductosReventaDetalles.fecha_recepcion || "-"}</DetailFieldValue>
          <DetailFieldValue>{lotesProductosReventaDetalles.fecha_caducidad || "-"}</DetailFieldValue>
          <DetailFieldValue>{lotesProductosReventaDetalles.cantidad_recibida || "-"}</DetailFieldValue>
          <DetailFieldValue>{lotesProductosReventaDetalles.stock_actual_lote || "-"}</DetailFieldValue>
          <DetailFieldValue>${lotesProductosReventaDetalles.coste_unitario_lote_usd || "-"}</DetailFieldValue>
          <DetailFieldValue>{lotesProductosReventaDetalles.proveedor?.nombre_proveedor || "-"}</DetailFieldValue>
          <DetailFieldValue>{lotesProductosReventaDetalles.estado || "-"}</DetailFieldValue>
        </div>
      </div>

      <div className="flex flex-col gap-2 min-w-[120px]">
        {lotesProductosReventaDetalles.estado === "DISPONIBLE" ? (
          <button
            onClick={handleChangeEstadoLote}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors shadow-sm"
          >
            <img src={BorrarIcon} alt="Inactivar" className="size-5 filter brightness-0 invert" />
            <span>Inactivar</span>
          </button>
        ) : (
          <button
            onClick={handleChangeEstadoLote}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors shadow-sm"
          >
            <img src={CheckIcon} alt="Activar" className="size-5 filter brightness-0 invert" />
            <span>Activar</span>
          </button>
        )}
      </div>
    </div>
  );
};
