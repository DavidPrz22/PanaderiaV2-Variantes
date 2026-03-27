import { useRecetasContext } from "@/context/RecetasContext";
import RecetasLista from "./RecetasLista";
import FilterSearch from "./FilterSearch";

export default function RecetasPanel() {
  const { showRecetasForm, showRecetasDetalles, recetaDetallesLoading } =
    useRecetasContext();
  if (showRecetasForm || showRecetasDetalles) return <></>;

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        <FilterSearch />
        <RecetasLista isLoadingDetalles={recetaDetallesLoading} />
      </div>
    </>
  );
}
