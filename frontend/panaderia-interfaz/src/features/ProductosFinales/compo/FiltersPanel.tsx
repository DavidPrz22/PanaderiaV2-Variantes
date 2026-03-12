import { useEffect, useMemo, useState, useLayoutEffect } from "react";
import { useGetProductosFinales } from "../hooks/queries/queries";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";

export default function FiltersPanel() {
  const {
    showFiltersPanel,
    selectedUnidadesVenta,
    setSelectedUnidadesVenta,
    selectedCategoriasProductoFinal,
    setSelectedCategoriasProductoFinal,
    setShowFiltersPanel,
    setProductosFinalesSearchTerm,
    categoriasProductoFinal,
    unidadesMedida,
  } = useProductosFinalesContext();
  const { data: productosFinales } = useGetProductosFinales();

  // Extract all results from all pages for filters
  const allProductos = useMemo(() => {
    if (!productosFinales?.pages) return [];
    return productosFinales.pages.flatMap(page => page.results || []);
  }, [productosFinales]);

  // Removed unidad search per request
  // We now derive categories directly from productos list per user request

  const opcionesUnidadVenta = useMemo(() => {
    const fromProductos = allProductos
      .map((p) => p.unidad_venta)
      .filter(Boolean);
    const fromContext = (unidadesMedida || []).map((u) => u.nombre_completo);
    return Array.from(new Set([...fromProductos, ...fromContext])).sort();
  }, [allProductos, unidadesMedida]);

  const opcionesCategorias = useMemo(() => {
    const fromProductos = allProductos
      .map((p) => p.categoria)
      .filter(Boolean);
    const fromContext = (categoriasProductoFinal || []).map(
      (c) => c.nombre_categoria,
    );
    return Array.from(new Set([...fromProductos, ...fromContext])).sort();
  }, [allProductos, categoriasProductoFinal]);

  useEffect(() => {
    // Close panel on escape
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowFiltersPanel(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setShowFiltersPanel]);

  const [style, setStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!showFiltersPanel) return;
    const anchor = document.getElementById("pf-filters-anchor");
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const panelWidth = 544; // ~ 34rem
    const estimatedHeight = 420; // rough initial estimate; will be constrained
    const margin = 8;

    let top = rect.bottom + margin;
    let left = rect.left;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (left + panelWidth > vw - margin) {
      left = Math.max(margin, vw - panelWidth - margin);
    }
    if (top + estimatedHeight > vh - margin) {
      // try placing above
      const aboveTop = rect.top - estimatedHeight - margin;
      if (aboveTop >= margin) {
        top = aboveTop;
      } else {
        // clamp to fit viewport
        top = Math.max(margin, vh - estimatedHeight - margin);
      }
    }
    setStyle({ top: `${top}px`, left: `${left}px`, width: "34rem" });
  }, [showFiltersPanel, productosFinales]);

  if (!showFiltersPanel) return null;

  const toggleUnidad = (unidad: string) => {
    setSelectedUnidadesVenta((prev: string[]) =>
      prev.includes(unidad)
        ? prev.filter((u: string) => u !== unidad)
        : [...prev, unidad],
    );
  };
  const toggleCategoria = (cat: string) => {
    setSelectedCategoriasProductoFinal((prev: string[]) =>
      prev.includes(cat)
        ? prev.filter((c: string) => c !== cat)
        : [...prev, cat],
    );
  };

  const clearAll = () => {
    setSelectedUnidadesVenta([]);
    setSelectedCategoriasProductoFinal([]);
    setProductosFinalesSearchTerm("");
  };

  return (
    <div
      id="pf-filters-panel"
      style={style}
      className="fixed z-50 bg-gradient-to-br from-white via-white to-blue-50/60 backdrop-blur-sm shadow-[0_4px_24px_-4px_rgba(0,0,0,0.15)] border border-gray-200/70 rounded-xl p-5 flex flex-col gap-5 animate-fade-in max-h-[min(80vh,520px)] overflow-hidden ring-1 ring-black/5"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col">
          <h3 className="font-semibold font-[Roboto] text-gray-800 text-lg tracking-tight flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Filtros
          </h3>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mt-1">
            Ajusta la vista de productos
          </p>
        </div>
        <button
          onClick={() => setShowFiltersPanel(false)}
          className="text-xs px-2 py-1 rounded-md border border-gray-200 cursor-pointer hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6 overflow-auto pr-1 ">
        <div className="flex flex-col gap-2">
          <p className="font-medium text-[13px] text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded bg-blue-400" /> Unidad de Venta
          </p>
          <div className="flex flex-col gap-1 rounded-lg bg-white/70 border border-gray-200 p-2 shadow-sm max-h-50 overflow-auto custom-scrollbar">
            {opcionesUnidadVenta.map((u) => (
              <label
                key={u}
                className="group flex items-center gap-2 text-[12px] cursor-pointer rounded-md px-2 py-1 hover:bg-blue-50/70 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedUnidadesVenta.includes(u)}
                  onChange={() => toggleUnidad(u)}
                  className="accent-blue-600 w-3.5 h-3.5 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 group-hover:text-gray-900 truncate">
                  {u}
                </span>
              </label>
            ))}
            {opcionesUnidadVenta.length === 0 && (
              <p className="text-[11px] text-gray-400 px-2 py-1">Sin datos</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-medium text-[13px] text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded bg-emerald-400" /> Categoría
          </p>
            <div className="flex flex-col gap-1 rounded-lg bg-white/70 border border-gray-200 p-2 shadow-sm max-h-50 overflow-auto custom-scrollbar">
            {opcionesCategorias.map((c) => (
              <label
                key={c}
                className="group flex items-center gap-2 text-[12px] cursor-pointer rounded-md px-2 py-1 hover:bg-emerald-50/70 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoriasProductoFinal.includes(c)}
                  onChange={() => toggleCategoria(c)}
                  className="accent-emerald-600 w-3.5 h-3.5 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span className="text-gray-700 group-hover:text-gray-900 truncate">
                  {c}
                </span>
              </label>
            ))}
            {opcionesCategorias.length === 0 && (
              <p className="text-[11px] text-gray-400 px-2 py-1">Sin datos</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-3 border-t border-gray-200 mt-auto">
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {selectedUnidadesVenta.map((u) => (
            <span
              key={u}
              className="group text-[11px] bg-gradient-to-r from-blue-500/15 to-blue-600/20 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-300/40 hover:border-blue-400/70 backdrop-blur-sm"
            >
              <span className="truncate max-w-[120px]">{u}</span>
              <button
                onClick={() => toggleUnidad(u)}
                className="text-[10px] font-bold leading-none hover:text-blue-900 transition-colors"
                aria-label={`Eliminar filtro unidad ${u}`}
              >
                ×
              </button>
            </span>
          ))}
          {selectedCategoriasProductoFinal.map((c) => (
            <span
              key={c}
              className="group text-[11px] bg-gradient-to-r from-emerald-500/15 to-emerald-600/20 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-300/40 hover:border-emerald-400/70 backdrop-blur-sm"
            >
              <span className="truncate max-w-[120px]">{c}</span>
              <button
                onClick={() => toggleCategoria(c)}
                className="text-[10px] font-bold leading-none hover:text-emerald-900 transition-colors"
                aria-label={`Eliminar filtro categoria ${c}`}
              >
                ×
              </button>
            </span>
          ))}
          {selectedUnidadesVenta.length === 0 &&
            selectedCategoriasProductoFinal.length === 0 && (
              <p className="text-[11px] text-gray-400 select-none">
                No hay filtros activos
              </p>
            )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={clearAll}
            className="text-xs px-3 py-1.5 rounded-md border border-gray-300/70 hover:bg-gray-100/70 text-gray-600 hover:text-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            Limpiar
          </button>
          <button
            onClick={() => setShowFiltersPanel(false)}
            className="text-xs px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-600/30 transition-colors cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
