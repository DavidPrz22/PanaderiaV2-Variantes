import { TubeSpinner } from "@/assets";
import { PITableBody } from "./PITableBody";
import { PITableHeader } from "./PITableHeader";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { useGetProductosIntermedios, useGetProductosIntermediosDetalles } from "../hooks/queries/queries";
import { useEffect } from "react";
import { Paginator } from "@/components/Paginator";
import { usePageHook } from "@/hooks/usePageHook";

export default function ProductosIntermediosLista() {
  const {
    productosIntermediosSearchTerm,
    selectedUnidadesProduccion,
    selectedCategoriasIntermedio,
    agotadosFilter,
    bajoStockFilter,
    setSelectedUnidadesProduccion,
    setSelectedCategoriasIntermedio,
    setProductosIntermediosSearchTerm,
    setBajoStockFilter,
    setAgotadosFilter,
    currentPage,
    setCurrentPage,
  } = useProductosIntermediosContext();

  const {
    data: productosPagination,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useGetProductosIntermedios();

  const { productoIntermedioId } = useProductosIntermediosContext();
  const { isLoading: isLoadingDetalles } = useGetProductosIntermediosDetalles(productoIntermedioId!);

  const {
    page,
    setPage,
    currentPageResults: currentPageData,
    totalPages: pagesCount
  } = usePageHook(productosPagination, fetchNextPage, hasNextPage, 15, currentPage);

  // Update context page when local page changes
  useEffect(() => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [page, currentPage, setCurrentPage]);

  // Apply filters to current page data
  let displayData = currentPageData;

  if (productosIntermediosSearchTerm) {
    const term = productosIntermediosSearchTerm.toLowerCase();
    displayData = displayData.filter(
      (p) =>
        p.nombre_producto.toLowerCase().includes(term) ||
        p.SKU.toLowerCase().includes(term) ||
        (p.categoria_nombre || "").toLowerCase().includes(term) ||
        (p.unidad_produccion_nombre || "").toLowerCase().includes(term),
    );
  }
  if (selectedUnidadesProduccion.length > 0) {
    displayData = displayData.filter((p) =>
      selectedUnidadesProduccion.includes(p.unidad_produccion_nombre),
    );
  }
  if (selectedCategoriasIntermedio.length > 0) {
    displayData = displayData.filter((p) =>
      selectedCategoriasIntermedio.includes(p.categoria_nombre),
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
    productosIntermediosSearchTerm.length > 0 ||
    selectedUnidadesProduccion.length > 0 ||
    selectedCategoriasIntermedio.length > 0 ||
    agotadosFilter ||
    bajoStockFilter;

  const clearFilters = () => {
    setProductosIntermediosSearchTerm("");
    setSelectedUnidadesProduccion([]);
    setSelectedCategoriasIntermedio([]);
    setBajoStockFilter(false);
    setAgotadosFilter(false);
  };

  const isTrulyEmpty = !productosPagination || productosPagination.pages[0]?.results?.length === 0;

  return (
    <>
      <div className="relative mx-8 border border-gray-200 rounded-md min-h-[80%] h-full">
        <PITableHeader
          headers={[
            "ID",
            "Nombre",
            "Unidad de producción",
            "Stock",
            "Categoria",
            "Fecha de creación"
          ]}
        />
        <PITableBody
          data={displayData}
          isFetching={isFetching}
          anyFilterActive={anyFilterActive}
          clearFilters={clearFilters}
          isTrulyEmpty={isTrulyEmpty}
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
        <div className="mt-4 flex justify-center mb-8">
          <Paginator
            previousPage={page > 0}
            nextPage={hasNextPage || page < pagesCount - 1}
            pages={Array.from({ length: pagesCount }, (_, i) => i)}
            currentPage={page}
            onClickPrev={() => setPage({ type: "previous" })}
            onClickPage={(p) => setPage({ type: "base", payload: p })}
            onClickNext={() => setPage({ type: "next" })}
          />
        </div>
      )}
    </>
  );
}

