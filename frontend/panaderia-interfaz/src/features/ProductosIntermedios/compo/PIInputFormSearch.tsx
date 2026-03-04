import RecetaSearchContainer from "./RecetaSearchContainer";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { useGetRecetasSearchMutation } from "../hooks/mutations/productosIntermediosMutations";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
import SearchIconContainer from "@/components/SearchIconContainer";
import XIconContainer from "@/components/xIconContainer";
import NoResults from "@/components/NoResults";
import React, { useEffect, useState } from "react";
import type { RecetaRelacionada, setValueProps } from "../types/types";

export default function PIInputFormSearch({
  setValue,
  initialData,
}: setValueProps & { initialData?: RecetaRelacionada }) {
  const {
    searchList,
    searchTimer,
    setSearchTimer,
    setSearchList,
    recetaSearchInputRef,
  } = useProductosIntermediosContext();
  const { mutate: getRecetasSearch, isPending } = useGetRecetasSearchMutation();
  const [isFocused, setIsFocused] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isFocused) return;

    const handleClickOutside = (event: MouseEvent) => {
      const container = document.getElementById("receta-search-container");
      if (!container?.contains(event.target as HTMLElement)) {
        setIsFocused(false);
        setSearchTimer(null);
        setSearchList([]);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isFocused, setSearchTimer, setSearchList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setSearchTimer(null);
      setSearchList([]);
      return;
    }

    if (searchTimer) {
      clearTimeout(searchTimer);
      setSearchTimer(null);
    }

    const timer = setTimeout(() => {
      if (e.target.value.length === 0) return;

      getRecetasSearch(e.target.value, {
        onSuccess: (data) => {
          setSearchList(data);
          setCompleted(true);
        },
      });
    }, 1000);
    setSearchTimer(timer);
  };

  const handleResetSearch = () => {
    if (recetaSearchInputRef.current) {
      recetaSearchInputRef.current.value = "";
      recetaSearchInputRef.current.disabled = false;
    }
    setSearchList([]);
    if (setValue) {
      setValue("receta_relacionada", -1);
    }
  };

  const handleFocus = () => {
    setSearchList([]);
    setIsFocused(true);
    setCompleted(false);
  };

  return (
    <div id="receta-search-container" className="flex flex-col relative">
      <div className="relative">
        <input
          ref={recetaSearchInputRef}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="Busca una receta para el producto"
          defaultValue={initialData ? initialData.nombre : ""}
          disabled={initialData ? true : false}
          type="text"
          className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-md shadow-xs font-[Roboto]
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />

        {recetaSearchInputRef.current?.disabled ? (
          <XIconContainer onClick={handleResetSearch} />
        ) : (
          <SearchIconContainer />
        )}
      </div>

      {isFocused &&
        (isPending ? (
          <PendingTubeSpinner
            size={10}
            extraClass="absolute top-[100%] left-0 w-full h-full bg-white border border-gray-300 rounded-md shadow-md"
          />
        ) : completed && searchList.length === 0 ? (
          <NoResults>Ninguna receta encontrada...</NoResults>
        ) : searchList.length > 0 ? (
          <RecetaSearchContainer searchList={searchList} setValue={setValue} />
        ) : null)}
    </div>
  );
}
