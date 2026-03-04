import { DetailsField } from "@/components/DetailsField";
import { DetailFieldValue } from "@/components/DetailFieldValue";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { RecetaFieldValue } from "./RecetaFieldValue";
import { DeleteComponent } from "./DeleteComponent";
import { useRemoveRecetaRelacionadaMutation } from "../hooks/mutations/productosIntermediosMutations";
import type { ProductosIntermediosDetalles } from "../types/types";

export const DetailsTable = ({
  productoIntermediosDetalles,
}: {
  productoIntermediosDetalles: ProductosIntermediosDetalles;
}) => {
  const { deleteRecetaRelacionada, setDeleteRecetaRelacionada } =
    useProductosIntermediosContext();
  const {
    mutateAsync: removeRecetaRelacionada,
    isPending: isPendingRemoveRecetaRelacionada,
  } = useRemoveRecetaRelacionadaMutation();

  const handleDeleteRecetaRelacionada = async () => {
    if (productoIntermediosDetalles?.id) {
      await removeRecetaRelacionada(productoIntermediosDetalles.id);
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
          SKU
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Punto de reorden
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Unidad de medida
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Categoría
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
          {productoIntermediosDetalles.nombre_producto}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoIntermediosDetalles.id}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoIntermediosDetalles.SKU}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoIntermediosDetalles.stock_actual}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {
            productoIntermediosDetalles.unidad_produccion_producto
              .nombre_completo
          }
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoIntermediosDetalles.categoria_producto.nombre_categoria}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoIntermediosDetalles.fecha_creacion_registro}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productoIntermediosDetalles.descripcion || "No hay descripción"}
        </DetailFieldValue>
        <RecetaFieldValue
          recetaRelacionada={
            productoIntermediosDetalles.receta_relacionada || false
          }
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
