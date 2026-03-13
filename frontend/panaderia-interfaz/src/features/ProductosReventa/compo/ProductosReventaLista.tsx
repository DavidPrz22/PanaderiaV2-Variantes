import { TubeSpinner } from "@/assets";
import { PRTableBody } from "./PRTableBody";
import { PRTableHeader } from "./PRTableHeader";
import { useGetProductosReventa, useGetProductosReventaDetalles } from "../hooks/queries/queries";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { useEffect, useMemo, useReducer } from "react";
import { Paginator } from "@/components/Paginator";

type PaginatorActions = "next" | "previous" | "base";

export default function ProductosReventaLista() {
  const {
    productoReventaId,
    productosReventaSearchTerm,
    selectedCategoriasReventa,
    selectedUnidadesInventario,
    agotadosFilter,
    bajoStockFilter,
    setProductosReventaSearchTerm,
    setSelectedCategoriasReventa,
    setSelectedUnidadesInventario,
    setBajoStockFilter,
    setAgotadosFilter,
    currentPage,
    setCurrentPage,
  } = useProductosReventaContext();

  const {
    data: productosPagination,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useGetProductosReventa();

  const { isLoading: isLoadingDetalles } = useGetProductosReventaDetalles(productoReventaId!);

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

  if (productosReventaSearchTerm) {
    const term = productosReventaSearchTerm.toLowerCase();
    displayData = displayData.filter(
      (p) =>
        p.nombre_producto.toLowerCase().includes(term) ||
        (p.SKU || "").toLowerCase().includes(term) ||
        (p.categoria_nombre || "").toLowerCase().includes(term) ||
        (p.unidad_base_inventario_nombre || "").toLowerCase().includes(term),
    );
  }

  if (selectedCategoriasReventa.length > 0) {
    displayData = displayData.filter((p) =>
      selectedCategoriasReventa.includes(p.categoria_nombre),
    );
  }

  if (selectedUnidadesInventario.length > 0) {
    displayData = displayData.filter((p) =>
      p.unidad_base_inventario_nombre && selectedUnidadesInventario.includes(p.unidad_base_inventario_nombre)
    );
  }

  if (agotadosFilter && bajoStockFilter) {
    displayData = displayData.filter((p) => Number(p.stock_actual) === 0 || Number(p.stock_actual) < Number(p.punto_reorden));
  }
  else if (agotadosFilter) {
    displayData = displayData.filter((p) => Number(p.stock_actual) === 0);
  } else if (bajoStockFilter) {
    displayData = displayData.filter((p) => Number(p.stock_actual) < Number(p.punto_reorden));
  }

  const anyFilterActive =
    productosReventaSearchTerm.length > 0 ||
    selectedCategoriasReventa.length > 0 ||
    selectedUnidadesInventario.length > 0 ||
    agotadosFilter ||
    bajoStockFilter;

  const clearFilters = () => {
    setProductosReventaSearchTerm("");
    setSelectedCategoriasReventa([]);
    setSelectedUnidadesInventario([]);
    setBajoStockFilter(false);
    setAgotadosFilter(false);
  };

  const isTrulyEmpty = !productosPagination || productosPagination.pages[0]?.results?.length === 0;


  return (
    <>
      <div className="relative mx-8 border border-gray-200 rounded-md min-h-[80%] h-full">
        <PRTableHeader
          headers={[
            "ID",
            "Nombre",
            "SKU",
            "Stock",
            "Punto de Reorden",
            "Precio Venta",
            "Categoría",
            "Unidad de inventario",
            "Fecha de creación",
          ]}
        />
        <PRTableBody
          data={displayData}
          isFetching={isFetching}
          anyFilterActive={anyFilterActive}
          clearFilters={clearFilters}
          isTrulyEmpty={isTrulyEmpty}
        />
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
        <div className="mt-4 flex justify-center mb-8">
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