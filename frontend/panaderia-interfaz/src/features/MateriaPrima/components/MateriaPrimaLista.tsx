import { useEffect, useMemo, useReducer } from "react"
import { useInfiniteQuery } from "@tanstack/react-query";
import { createMateriaPrimaListQueryOptions } from "@/features/MateriaPrima/hooks/queries/materiaPrimaQueryOptions";
import { TubeSpinner } from "@/assets";

import { Paginator } from "@/components/Paginator";
import { TableBody } from "@/features/MateriaPrima/components/TableBody";
import { TableHeader } from "@/features/MateriaPrima/components/TableHeader";

import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";

type PaginatorActions = "next" | "previous" | "base";

export default function MateriaPrimaLista({
  isLoadingDetalles = false,
}: {
  isLoadingDetalles?: boolean;
}) {
  const {
    filteredApplied,
    MPFilteredInputSearchApplied,
    inputfilterDoubleApplied,
    currentPage,
    setCurrentPage,
  } = useMateriaPrimaContext();

  const {
    data: materiaPrimaPagination,
    fetchNextPage,
    hasNextPage,
    isFetching: isMateriaPrimaListFetching,
  } = useInfiniteQuery(createMateriaPrimaListQueryOptions());

  // Handle pagination state with reducer for complex logic

  const [page, dispatch] = useReducer(
    (state: number, action: { type: PaginatorActions; payload?: number }) => {
      switch (action.type) {
        case "next":
          if (materiaPrimaPagination) {
            if (state < (materiaPrimaPagination.pages?.length || 0) - 1) return state + 1;
            if (hasNextPage) fetchNextPage();
            return state + 1;
          }
          return state;
        case "previous":
          return Math.max(0, state - 1);
        case "base":
          const targetPage = action.payload ?? 0;
          // Check if we need to fetch more pages
          if (targetPage >= (materiaPrimaPagination?.pages?.length || 0) && hasNextPage) {
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
  }, [page, setCurrentPage]); // Removed currentPage to prevent circular dependency


  // Calculate total pages
  const pagesCount = useMemo(() => {
    const resultCount = materiaPrimaPagination?.pages?.[0]?.count || 0;
    const entriesPerPage = 15;
    return Math.ceil(resultCount / entriesPerPage);
  }, [materiaPrimaPagination]);

  // Get current page data
  const currentPageData = materiaPrimaPagination?.pages[page]?.results || [];


  return (
    <>
      <div className="relative mx-8 border border-gray-200 rounded-md min-h-[80%] h-full">
        <TableHeader
          headers={[
            "Id",
            "Nombre",
            "Unidad de medida",
            "Categoria",
            "Stock",
            "Punto de reorden",
            "Fecha de creación",
            "Acciones",
          ]}
        />

        <TableBody
          currentPageData={currentPageData}
          isMateriaPrimaListFetching={isMateriaPrimaListFetching}
        />

        {isLoadingDetalles ? (
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white opacity-50">
            <img src={TubeSpinner} alt="Cargando..." className="size-28" />
          </div>
        ) : (
          ""
        )}
        {/* Show paginator only if there are multiple pages and no active filters */}
      </div>
      {!filteredApplied && !MPFilteredInputSearchApplied && !inputfilterDoubleApplied && pagesCount > 1 && (
        <div className=" flex justify-center">
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
