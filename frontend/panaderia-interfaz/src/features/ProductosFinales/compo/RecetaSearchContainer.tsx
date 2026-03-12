import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";
import type { recetasSearchItem } from "../types/types";
import type { UseFormSetValue } from "react-hook-form";
import type { TProductoFinalSchema } from "../schemas/schemas";

export default function RecetaSearchContainer({
  searchList,
  setValue,
}: {
  searchList: recetasSearchItem[];
  setValue?: UseFormSetValue<TProductoFinalSchema>;
}) {
  const { setSearchList, recetaSearchInputRef } = useProductosFinalesContext();
  return (
    <div className="absolute flex flex-col top-[100%] left-0 w-full max-h-[247px] overflow-y-auto border border-gray-300 rounded-md shadow-md bg-white z-10">
      {searchList.map((item) => (
        <div
          key={item.id}
          className="border-b border-gray-300 py-2 px-4 cursor-pointer hover:bg-gray-100"
          onClick={() => {
            if (recetaSearchInputRef.current) {
              recetaSearchInputRef.current.value = item.nombre;
              recetaSearchInputRef.current.disabled = true;
            }
            setSearchList([]);
            if (setValue) {
              setValue("receta_relacionada", item.id);
            }
          }}
        >
          {item.nombre}
        </div>
      ))}
    </div>
  );
}
