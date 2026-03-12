import { DetailsField } from "@/components/DetailsField";
import { DetailFieldValue } from "@/components/DetailFieldValue";
import { RecetaFieldValue } from "./RecetaFieldValue";
import { DeleteComponent } from "./DeleteComponent";
import { useRemoveRecetaRelacionadaMutation } from "../hooks/mutations/productosFinalesMutations";
import type { ProductoFinalDetalles } from "../types/types";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";

export const DetailsTable = ({
  productoFinalDetalles,
}: {
  productoFinalDetalles: ProductoFinalDetalles;
}) => {
  const { deleteRecetaRelacionada, setDeleteRecetaRelacionada } =
    useProductosFinalesContext();
  const {
    mutateAsync: removeRecetaRelacionada,
    isPending: isPendingRemoveRecetaRelacionada,
  } = useRemoveRecetaRelacionadaMutation();

  const handleDeleteRecetaRelacionada = async () => {
    if (productoFinalDetalles?.id) {
      await removeRecetaRelacionada(productoFinalDetalles.id);
      setDeleteRecetaRelacionada(false);
    }
  };
  return (
    <div className="flex items-center gap-20">
      <div className="grid grid-rows-9 grid-cols-1 gap-2">
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Nombre del producto
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Id del producto
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Unidad de Venta
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Unidad de Producción
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Categoría
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Tipo de manejo de venta
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Fecha de creación del registro
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Descripción
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Receta relacionada
        </DetailsField>
      </div>
      <div className="grid grid-rows-9 grid-cols-1 gap-2">
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoFinalDetalles.nombre_producto || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoFinalDetalles.id || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoFinalDetalles.unidad_venta_producto?.nombre_completo || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoFinalDetalles.unidad_produccion_producto
            .nombre_completo || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoFinalDetalles.categoria_producto.nombre_categoria || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoFinalDetalles.tipo_medida_fisica || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoFinalDetalles.fecha_creacion_registro || "-"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoFinalDetalles.descripcion || "No hay descripción"}
        </DetailFieldValue>
        <RecetaFieldValue
          recetaRelacionada={productoFinalDetalles.receta_relacionada || false}
        />
      </div>
      {deleteRecetaRelacionada && (
        <DeleteComponent
          cancelFunction={() => setDeleteRecetaRelacionada(false)}
          deleteFunction={handleDeleteRecetaRelacionada}
          isLoading={isPendingRemoveRecetaRelacionada}
          title="Seguro que desea desvincular esta receta?"
          buttonText="Desvincular"
        />
      )}
    </div>
  );
};
