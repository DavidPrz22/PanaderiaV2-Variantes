import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import type { ProductosIntermedios } from "../types/types";

export const PITableRow = ({
  item,
  index,
}: {
  item: ProductosIntermedios;
  index: number;
}) => {
  const { setProductoIntermedioId, setEnabledDetalles } =
    useProductosIntermediosContext();
  const setDetails = () => {
    setProductoIntermedioId(item.id || null);
    setEnabledDetalles(true);
  };
  return (
    <div
      onClick={setDetails}
      key={item.id}
      className={`cursor-pointer hover:bg-gray-100 grid grid-cols-[0.5fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr] justify-between items-center px-8 py-4 border-b border-gray-300 ${index % 2 == 0 ? "bg-white" : "bg-gray-50"} font-[Roboto] text-sm`}
    >
      <div>{item.id || "-"}</div>
      <div>{item.nombre_producto || "-"}</div>
      <div>{item.SKU || "-"}</div>
      <div>{item.stock_actual || "-"}</div>
      <div>{item.unidad_produccion_producto || "-"}</div>
      <div>{item.punto_reorden || "-"}</div>
      <div>{item.categoria_nombre || "-"}</div>
    </div>
  );
};
