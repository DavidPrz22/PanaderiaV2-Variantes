import { useRecetasSearchMutation } from "../hooks/mutations/recetasMutations";
import NoResults from "./NoResults";
import RecetasFormInputContainer from "./RecetasFormInputContainer";
import RecetasFormLoading from "./RecetasFormLoading";
import { useRecetasContext } from "@/context/RecetasContext";
import RecetaListSearchContainer from "./RecetaListSearchContainer";
import type { TRecetasFormSchema } from "../schemas/schemas";
import type {
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useEffect } from "react";

export default function RecetaListContainer({
  errors,
  setValue,
  watch,
}: {
  errors: FieldErrors<TRecetasFormSchema>;
  setValue: UseFormSetValue<TRecetasFormSchema>;
  watch: UseFormWatch<TRecetasFormSchema>;
}) {
  const {
    searchListActiveRecetaList,
    searchListRecetaList,
    timer,
    recetaId,
    setTimer,
    setSearchListActiveRecetaList,
    setSearchListRecetaList,
  } = useRecetasContext();

  useEffect(() => {
    if (!searchListActiveRecetaList) return;
    const recetaRelacionadaContainer = document.getElementById(
      "receta-relacionada-container",
    );

    const handleClickOutside = (event: MouseEvent) => {
      if (
        recetaRelacionadaContainer &&
        !recetaRelacionadaContainer.contains(event.target as Node)
      ) {
        setSearchListActiveRecetaList(false);
        setSearchListRecetaList([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [
    searchListActiveRecetaList,
    setSearchListActiveRecetaList,
    setSearchListRecetaList,
  ]);

  const {
    mutateAsync: recetasSearchMutation,
    isPending: isRecetaSearchPending,
  } = useRecetasSearchMutation();

  const handleSearchRecetaListFocus = async (search: string) => {
    if (timer) {
      clearTimeout(timer);
    }
    const interval = setTimeout(() => {
      recetasSearchMutation({
        search,
        recetaId: recetaId ? recetaId : undefined,
      });
      setTimer(null);
    }, 1000);
    setTimer(interval as NodeJS.Timeout);
  };

  return (
    <div className="flex flex-col relative" id="receta-relacionada-container">
      <RecetasFormInputContainer
        title="Receta Relacionada"
        name="receta_relacionada"
        errors={errors}
        inputType="text"
        recetaBusqueda={true}
        optional={true}
        placeholder="Busca una receta relacionada..."
        onChange={handleSearchRecetaListFocus}
      />

      {searchListActiveRecetaList &&
        (isRecetaSearchPending ? (
          <RecetasFormLoading />
        ) : searchListRecetaList.length > 0 ? (
          <RecetaListSearchContainer
            searchList={searchListRecetaList}
            watch={watch}
            setValue={setValue}
          />
        ) : (
          !timer && <NoResults />
        ))}
    </div>
  );
}
