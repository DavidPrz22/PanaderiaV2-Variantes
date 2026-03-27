import type { TRecetasFormSchema } from "../schemas/schemas";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useRecetasContext } from "@/context/RecetasContext";
import RecetaListItem from "./RecetaListItem";

export default function RecetasListadasForm({
  watch,
  setValue,
}: {
  watch: UseFormWatch<TRecetasFormSchema>;
  setValue: UseFormSetValue<TRecetasFormSchema>;
}) {
  const { recetasListadas } = useRecetasContext();
  return (
    <div className="flex flex-col">
      {recetasListadas.length > 0 ? (
        recetasListadas.map((receta, index) => (
          <RecetaListItem
            key={index}
            nombre={receta.nombre}
            id={receta.id}
            last={index === recetasListadas.length - 1}
            watch={watch}
            setValue={setValue}
          />
        ))
      ) : (
        <div className="text-center text-gray-500 h-[80px] flex items-center justify-center font-[Roboto] text-lg">
          No hay recetas listadas
        </div>
      )}
    </div>
  );
}
