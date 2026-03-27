import { XRedIcon } from "@/assets/DashboardAssets/";
import { useRecetasContext } from "@/context/RecetasContext";
import type { recetaListItemProps, watchSetValueProps } from "../types/types";
import { toast } from "sonner";

export default function RecetaListItem({
  nombre,
  id,
  last,
  watch,
  setValue,
}: recetaListItemProps & watchSetValueProps) {
  const { setRecetasListadas, recetasListadas } = useRecetasContext();

  const handleDelete = () => {
    if (recetasListadas.length < 1) return;

    const listaFiltrada = recetasListadas.filter((receta) => receta.id !== id);
    setRecetasListadas(listaFiltrada);

    const listaFiltradaValidacion = watch("receta_relacionada")?.filter(
      (itemId) => itemId !== id,
    );
    setValue("receta_relacionada", listaFiltradaValidacion || []);

    toast.success("Receta eliminada");
  };

  return (
    <div
      className={`flex items-center justify-between text-md px-5 py-2 ${last ? "" : "border-b border-gray-300"}`}
    >
      {nombre}
      <div onClick={handleDelete} className="cursor-pointer">
        <img src={XRedIcon} alt="delete" className="size-6" />
      </div>
    </div>
  );
}
