import { TubeSpinner } from "@/assets";

import { PFTableBody } from "./PFTableBody";
import { PFTableHeader } from "./PFHeader";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";
import { useGetProductosFinales } from "../hooks/queries/queries";
import { useEffect, useMemo, useReducer } from "react";
import { Paginator } from "@/components/Paginator";

type PaginatorActions = "next" | "previous" | "base";

export default function ProductosFinalesLista() {
  const {
    isLoadingDetalles,
    productosFinalesSearchTerm,
    selectedUnidadesVenta,
    selectedCategoriasProductoFinal,
    agotadosFilter,
    bajoStockFilter,
    setSelectedUnidadesVenta,
    setSelectedCategoriasProductoFinal,
    setProductosFinalesSearchTerm,
    currentPage,
    setCurrentPage,
  } = useProductosFinalesContext();

  const {
    data: productosPagination,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useGetProductosFinales();

  // Handle pagination state with reducer for complex logic
  const [page, dispatch] = useReducer(
    (state: number, action: { type: PaginatorActions; payload?: number }) => {
      switch (action.type) {
        case "next":
          if (productosPagination) {
            if (state < (productosPagination.pages?.length || 0) - 1) return state + 1;
            if (hasNextPage) fetchNextPage();
            return state + 1;
          }
          return state;
        case "previous":
          return Math.max(0, state - 1);
        case "base":
          const targetPage = action.payload ?? 0;
          // Check if we need to fetch more pages
          if (targetPage >= (productosPagination?.pages?.length || 0) && hasNextPage) {
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
    const resultCount = productosPagination?.pages?.[0]?.count || 0;
    const entriesPerPage = 15;
    return Math.ceil(resultCount / entriesPerPage);
  }, [productosPagination]);

  // Get current page data
  const currentPageData = productosPagination?.pages[page]?.results || [];

  // Apply filters to current page data
  let displayData = currentPageData;

  if (productosFinalesSearchTerm) {
    const term = productosFinalesSearchTerm.toLowerCase();
    displayData = displayData.filter(
      (p) =>
        p.nombre_producto.toLowerCase().includes(term) ||
        (p.categoria_nombre || "").toLowerCase().includes(term) ||
        (p.unidad_venta_nombre || "").toLowerCase().includes(term),
    );
  }

  if (selectedUnidadesVenta.length > 0) {
    displayData = displayData.filter((p) =>
      selectedUnidadesVenta.includes(p.unidad_venta_nombre),
    );
  }

  if (selectedCategoriasProductoFinal.length > 0) {
    displayData = displayData.filter((p) =>
      selectedCategoriasProductoFinal.includes(p.categoria_nombre),
    );
  }

  if (agotadosFilter) {
    displayData = displayData.filter((p) => Number(p.stock_actual) === 0);
  }

  // Sort by id ascending
  displayData = displayData.sort((a, b) => a.id - b.id);

  const anyFilterActive =
    productosFinalesSearchTerm.length > 0 ||
    selectedUnidadesVenta.length > 0 ||
    selectedCategoriasProductoFinal.length > 0 ||
    agotadosFilter ||
    bajoStockFilter;

  const handleClearFilters = () => {
    setProductosFinalesSearchTerm("");
    setSelectedUnidadesVenta([]);
    setSelectedCategoriasProductoFinal([]);
  };

  const hasData = productosPagination && productosPagination.pages[0]?.results?.length > 0;

  return (
    <>
      <div className="relative mx-8 border border-gray-200 rounded-md min-h-[80%] h-full">
        <PFTableHeader
          headers={[
            "ID",
            "Nombre",
            "Unidad Produccion",
            "Categoria",
            "Unidad de Venta",
            "Stock",
            "Fecha Creación",
          ]}
        />
        <PFTableBody
          displayData={displayData}
          isFetching={isFetching}
          hasData={!!hasData}
          anyFilterActive={anyFilterActive}
          onClearFilters={handleClearFilters}
        />
        {isLoadingDetalles && !isFetching ? (
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white opacity-50">
            <img src={TubeSpinner} alt="Cargando..." className="size-28" />
          </div>
        ) : (
          ""
        )}
      </div>

      {/* Show paginator only if there are multiple pages and no active filters */}
      {!anyFilterActive && pagesCount > 1 && (
        <div className="mt-4 flex justify-center">
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
