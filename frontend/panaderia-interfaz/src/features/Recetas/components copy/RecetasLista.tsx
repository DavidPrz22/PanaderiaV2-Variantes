import { TubeSpinner } from "@/assets";
import { RecetasTableHeader } from "./RecetasTableHeader";
import { RecetasTableBody } from "./RecetasTableBody";
import { useRecetasQuery } from "../hooks/queries/queries";
import { useRecetasContext } from "@/context/RecetasContext";
import { useEffect, useMemo, useReducer } from "react";
import { Paginator } from "@/components/Paginator";
import type { recetaItem } from "../types/types";

type PaginatorActions = "next" | "previous" | "base";

export default function RecetasLista({
  isLoadingDetalles,
}: {
  isLoadingDetalles: boolean;
}) {
  const {
    data: recetasPagination,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useRecetasQuery();

  const {
    recetaUnicaFiltro,
    recetaCompuestaFiltro,
    fechaSeleccionadaFiltro,
    searchTermFilter,
    currentPage,
    setCurrentPage,
  } = useRecetasContext();


  // Handle pagination state with reducer for complex logic
  const [page, dispatch] = useReducer(
    (state: number, action: { type: PaginatorActions; payload?: number }) => {
      switch (action.type) {
        case "next":
          if (recetasPagination) {
            if (state < (recetasPagination.pages?.length || 0) - 1) return state + 1;
            if (hasNextPage) fetchNextPage();
            return state + 1;
          }
          return state;
        case "previous":
          return Math.max(0, state - 1);
        case "base":
          const targetPage = action.payload ?? 0;
          // Check if we need to fetch more pages
          if (targetPage >= (recetasPagination?.pages?.length || 0) && hasNextPage) {
            fetchNextPage();
          }
          return targetPage;
        default:
          return state;
      }
    },
    currentPage
  );

  // Update context page when local page changes
  useEffect(() => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [page, currentPage, setCurrentPage]);

  // Calculate total pages
  const pagesCount = useMemo(() => {
    const resultCount = recetasPagination?.pages?.[0]?.count || 0;
    const entriesPerPage = 15;
    return Math.ceil(resultCount / entriesPerPage);
  }, [recetasPagination]);

  // Get current page data
  const currentPageData = recetasPagination?.pages[page]?.results || [];

  const displayData = useMemo(() => {
    let data: recetaItem[] = currentPageData;

    if (searchTermFilter) {
      data = data.filter((item) =>
        item.nombre.toLowerCase().includes(searchTermFilter.toLowerCase())
      );
    }

    if (recetaUnicaFiltro) {
      data = data.filter((receta) => !receta.esCompuesta);
    }

    if (recetaCompuestaFiltro) {
      data = data.filter((receta) => receta.esCompuesta);
    }

    if (fechaSeleccionadaFiltro) {
      data = data.filter(
        (item) =>
          item.fecha_creacion >= fechaSeleccionadaFiltro.from &&
          item.fecha_creacion <= fechaSeleccionadaFiltro.to
      );
    }

    return data;
  }, [
    currentPageData,
    searchTermFilter,
    recetaUnicaFiltro,
    recetaCompuestaFiltro,
    fechaSeleccionadaFiltro,
  ]);

  const anyFilterActive =
    searchTermFilter ||
    recetaUnicaFiltro ||
    recetaCompuestaFiltro ||
    fechaSeleccionadaFiltro;

  return (
    <>
      <div className="relative mx-8 border border-gray-200 rounded-md min-h-[80%] h-full">
        <RecetasTableHeader headers={["ID", "Nombre", "Fecha de creación"]} />
        <RecetasTableBody data={displayData} isFetching={isFetching} />
        {isLoadingDetalles ? (
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white opacity-50">
            <img src={TubeSpinner} alt="Cargando..." className="size-28" />
          </div>
        ) : (
          ""
        )}
      </div>

      {/* Show paginator only if there are multiple pages and no active filters */}
      {!anyFilterActive && pagesCount > 1 && (
        <div className="flex justify-center">
          <Paginator
            previousPage={page > 0}
            nextPage={hasNextPage || page < pagesCount - 1}
            pages={Array.from({ length: pagesCount }, (_, i) => i)}
            currentPage={page}
            onClickPrev={() => dispatch({ type: "previous" })}
            onClickPage={(p) => dispatch({ type: "base", payload: p })}
            onClickNext={() => dispatch({ type: "next" })}
          />
        </div>
      )}
    </>
  );
}
