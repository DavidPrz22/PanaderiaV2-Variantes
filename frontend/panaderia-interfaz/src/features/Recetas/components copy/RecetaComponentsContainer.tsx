import NoResults from "./NoResults";
import ComponentSearchListContainer from "./ComponentSearchListContainer";
import RecetasFormInputContainer from "./RecetasFormInputContainer";
import RecetasFormLoading from "./RecetasFormLoading";
import { useRecetasContext } from "@/context/RecetasContext";
import { useComponentesRecetaSearchMutation } from "../hooks/mutations/recetasMutations";
import type { RecetaComponentsContainerProps } from "../types/types";
import { useEffect } from "react";

export default function RecetaComponentsContainer({
  watch,
  setValue,
  errors,
}: RecetaComponentsContainerProps) {
  const {
    searchListActiveComponentes,
    setSearchListActiveComponentes,
    searchListComponentes,
    timer,
    setTimer,
    setSearchListComponentes,
  } = useRecetasContext();

  useEffect(() => {
    if (!searchListActiveComponentes) return;
    const componentesRecetaContainer = document.getElementById(
      "componentes-receta-container",
    );

    const handleClickOutside = (event: MouseEvent) => {
      if (
        componentesRecetaContainer &&
        !componentesRecetaContainer.contains(event.target as Node)
      ) {
        setSearchListActiveComponentes(false);
        setSearchListComponentes([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [
    searchListActiveComponentes,
    setSearchListActiveComponentes,
    setSearchListComponentes,
  ]);

  const {
    mutateAsync: componentesRecetaSearchMutation,
    isPending: isComponentesRecetaSearchPending,
  } = useComponentesRecetaSearchMutation();

  const handleSearchComponentesFocus = async (search: string) => {
    if (timer) {
      clearTimeout(timer);
    }
    const interval = setTimeout(() => {
      componentesRecetaSearchMutation(search);
      setTimer(null);
    }, 1000);
    setTimer(interval as NodeJS.Timeout);
  };

  return (
    <div className="flex flex-col relative" id="componentes-receta-container">
      <RecetasFormInputContainer
        title="Componentes"
        name="componente_receta"
        errors={errors}
        inputType="text"
        componenteBusqueda={true}
        onChange={handleSearchComponentesFocus}
        placeholder="Busca componentes..."
      />

      {searchListActiveComponentes &&
        (isComponentesRecetaSearchPending ? (
          <RecetasFormLoading />
        ) : searchListComponentes.length > 0 ? (
          <ComponentSearchListContainer watch={watch} setValue={setValue} />
        ) : (
          !timer && <NoResults />
        ))}
    </div>
  );
}
