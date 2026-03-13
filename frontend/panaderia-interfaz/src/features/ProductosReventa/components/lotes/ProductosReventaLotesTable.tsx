import { useMemo, useReducer } from "react";
import { useGetLotesProductosReventa } from "../../hooks/queries/queries";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { Paginator } from "@/components/Paginator";
import { ProductosReventaLotesTableHeader } from "./ProductosReventaLotesTableHeader";
import { ProductosReventaLotesTableBody } from "./ProductosReventaLotesTableBody";

type PaginatorActions = "next" | "previous" | "base";

export const ProductosReventaLotesTable = () => {
  const { productoReventaId } = useProductosReventaContext();
  const {
    data: lotesPagination,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useGetLotesProductosReventa(productoReventaId!);

  const [page, dispatch] = useReducer(
    (state: number, action: { type: PaginatorActions; payload?: number }) => {
      switch (action.type) {
        case "next":
          if (lotesPagination) {
            if (state < lotesPagination.pages.length - 1) return state + 1;
            if (hasNextPage) fetchNextPage();
            return state + 1;
          }
          return state;
        case "previous":
          return Math.max(0, state - 1);
        case "base":
          return action.payload ?? 0;
        default:
          return state;
      }
    },
    0
  );

  const lotesPage = useMemo(() => {
    return lotesPagination?.pages?.[page]?.results || [];
  }, [lotesPagination, page]);

  const pagesCount = useMemo(() => {
    if (!lotesPagination?.pages?.[0]) return 0;
    const resultCount = lotesPagination.pages[0].count || 0;
    const entriesPerPage = 15;
    return Math.ceil(resultCount / entriesPerPage);
  }, [lotesPagination]);

  return (
    <div className="w-full border border-gray-300 rounded-lg bg-white flex flex-col shadow-sm">
      <ProductosReventaLotesTableHeader />
      <ProductosReventaLotesTableBody data={lotesPage} isLoading={isFetching} />
      {pagesCount > 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
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
    </div>
  );
};
