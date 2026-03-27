import { useRecetasContext } from "@/context/RecetasContext";
import type { recetaItem } from "../types/types";

export const RecetaTablerow = ({
  item,
  index,
  last,
}: {
  item: recetaItem;
  index: number;
  last?: boolean;
}) => {
  const { setRecetaId, setEnabledRecetaDetalles } = useRecetasContext();

  const activateRecetaDetalles = () => {
    setRecetaId(item.id);
    setEnabledRecetaDetalles(true);
  };

  return (
    <div
      onClick={activateRecetaDetalles}
      key={item.id}
      className={`cursor-pointer hover:bg-gray-100 grid grid-cols-[1fr_1fr_1fr] justify-between items-center px-8 py-4 ${last ? "border-b-0 rounded-b-md" : "border-b border-gray-300"} ${index % 2 == 0 ? "bg-white" : "bg-gray-50"} font-[Roboto] text-sm`}
    >
      <div>{item.id || "-"}</div>
      <div>{item.nombre || "-"}</div>
      <div>{item.fecha_creacion.split("T")[0] || "-"}</div>
    </div>
  );
};
