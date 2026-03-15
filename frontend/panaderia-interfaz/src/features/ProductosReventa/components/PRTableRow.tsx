import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import type { ProductosReventa } from "../types/types";

export const PRTableRow = ({
  item,
  index,
}: {
  item: ProductosReventa;
  index: number;
}) => {
  const { setProductoReventaId, setEnabledDetalles } =
    useProductosReventaContext();
  const setDetails = () => {
    setProductoReventaId(item.id || null);
    setEnabledDetalles(true);
  };
  console.log(item);
  return (
    <div
      onClick={setDetails}
      key={item.id}
      className={`cursor-pointer hover:bg-gray-100 grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1fr_1.5fr_1.5fr] justify-between items-center px-8 py-4 border-b border-gray-300 ${index % 2 == 0 ? "bg-white" : "bg-gray-50"} font-[Roboto] text-sm`}
    >
      <div>{item.id || "-"}</div>
      <div>{item.nombre_producto || "-"}</div>
      <div>{item.unidad_base_inventario_nombre || "-"}</div>
      <div>{item.categoria_nombre || "-"}</div>
      <div>{item.stock_actual ? item.stock_actual : "sin stock"}</div>
      <div>{item.unidad_venta_nombre || "-"}</div>
      <div>{item.fecha_creacion_registro || "-"}</div>
    </div>
  );
};