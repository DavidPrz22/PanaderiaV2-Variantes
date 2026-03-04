import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import type { ProductosIntermedios } from "../types/types";

export const PITableRow = ({
  item,
  index,
}: {
  item: ProductosIntermedios;
  index: number;
}) => {
  const { setProductoIntermedioId } =
    useProductosIntermediosContext();
  const setDetails = () => {
    setProductoIntermedioId(item.id || null);

  };
  return (
    <div
      onClick={setDetails}
      key={item.id}
      className={`cursor-pointer hover:bg-gray-100 grid grid-cols-[0.5fr_1.5fr_1.5fr_1fr_1fr_1fr] justify-between items-center px-8 py-4 border-b border-gray-300 ${index % 2 == 0 ? "bg-white" : "bg-gray-50"} font-[Roboto] text-sm`}
    >
      <div>{item.id || "-"}</div>
      <div>{item.nombre_producto || "-"}</div>
      <div>{item.unidad_produccion_nombre || "-"}</div>
      <div>{item.stock_actual === 0 ? "Sin stock" : item.stock_actual}</div>
      <div>{item.categoria_nombre || "-"}</div>
      <div>{item.fecha_creacion_registro || "-"}</div>
    </div>
  );
};
