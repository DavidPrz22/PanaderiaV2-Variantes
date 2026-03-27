import { DetailFieldValue } from "@/components/DetailFieldValue";
import { DetailsField } from "@/components/DetailsField";
import { useRecetasContext } from "@/context/RecetasContext";

export const DetailsTable = () => {
  const { recetaDetalles } = useRecetasContext();

  return (
    <div className="flex items-center gap-20">
      <div className="grid grid-rows-4 grid-cols-1 gap-2">
        <DetailsField>Fecha de creación</DetailsField>
        <DetailsField>Fecha de modificación</DetailsField>
        <DetailsField>Notas</DetailsField>
        <DetailsField>Rendimiento</DetailsField>
        <DetailsField>Producto Vinculado</DetailsField>
        <DetailsField>Unidad de medida</DetailsField>
      </div>
      <div className="grid grid-rows-4 grid-cols-1 gap-2">
        <DetailFieldValue>
          {recetaDetalles?.receta.fecha_creacion?.split("T")[0] || "-"}
        </DetailFieldValue>
        <DetailFieldValue>
          {recetaDetalles?.receta.fecha_modificacion?.split("T")[0] || "-"}
        </DetailFieldValue>
        <DetailFieldValue>
          {recetaDetalles?.receta.notas || "-"}
        </DetailFieldValue>
        <DetailFieldValue>
          {recetaDetalles?.receta.rendimiento || "-"}
        </DetailFieldValue>
        <DetailFieldValue>
          {recetaDetalles?.receta.producto_elaborado || "-"}
        </DetailFieldValue>
        <DetailFieldValue>
          {recetaDetalles?.receta.unidad_medida_producto || "-"}
        </DetailFieldValue>
      </div>
    </div>
  );
};
