import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";

import FilterSearch from "@/features/MateriaPrima/components/FilterSearch";
import MateriaPrimaLista from "./MateriaPrimaLista";

export default function MateriaPrimaPanel() {
  const { showMateriaprimaForm, showMateriaprimaDetalles } =
    useMateriaPrimaContext();

  if (showMateriaprimaForm || showMateriaprimaDetalles) return <></>;

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        <FilterSearch />
        <MateriaPrimaLista />
      </div>
    </>
  );
}
