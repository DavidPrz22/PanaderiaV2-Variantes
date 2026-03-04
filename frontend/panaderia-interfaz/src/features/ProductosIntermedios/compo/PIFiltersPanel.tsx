import { useEffect, useMemo, useState, useLayoutEffect } from 'react';
import { useGetProductosIntermedios } from '../hooks/queries/queries';
import { useProductosIntermediosContext } from '@/context/ProductosIntermediosContext';

interface ProductoIntermedioItem {
  unidad_produccion_producto: string;
  categoria_nombre: string;
}

export default function PIFiltersPanel() {
  const {
    showPIFiltersPanel,
    setShowPIFiltersPanel,
    selectedUnidadesProduccion,
    setSelectedUnidadesProduccion,
    selectedCategoriasIntermedio,
    setSelectedCategoriasIntermedio,
    unidadesMedida,
    categoriasProductoIntermedio,
    setProductosIntermediosSearchTerm,
  } = useProductosIntermediosContext();
  const { data: productosIntermedios } = useGetProductosIntermedios();

  // Extract all results from all pages for filters
  const allProductos = useMemo(() => {
    if (!productosIntermedios?.pages) return [];
    return productosIntermedios.pages.flatMap(page => page.results || []);
  }, [productosIntermedios]);

  const opcionesUnidades = useMemo(() => {
    const fromProductos = allProductos
      .map((p: ProductoIntermedioItem) => p.unidad_produccion_producto)
      .filter(Boolean);
    const fromContext = (unidadesMedida || []).map((u) => u.nombre_completo);
    return Array.from(new Set([...fromProductos, ...fromContext])).sort();
  }, [allProductos, unidadesMedida]);

  const opcionesCategorias = useMemo(() => {
    const fromProductos = allProductos
      .map((p: ProductoIntermedioItem) => p.categoria_nombre)
      .filter(Boolean);
    const fromContext = (categoriasProductoIntermedio || []).map(
      (c) => c.nombre_categoria,
    );
    return Array.from(new Set([...fromProductos, ...fromContext])).sort();
  }, [allProductos, categoriasProductoIntermedio]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPIFiltersPanel(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setShowPIFiltersPanel]);

  const [style, setStyle] = useState<React.CSSProperties>({});
  useLayoutEffect(() => {
    if (!showPIFiltersPanel) return;
    const anchor = document.getElementById('pi-filters-anchor');
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const panelWidth = 544;
    const estimatedHeight = 420;
    const margin = 8;
    let top = rect.bottom + margin;
    let left = rect.left;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (left + panelWidth > vw - margin) {
      left = Math.max(margin, vw - panelWidth - margin);
    }
    if (top + estimatedHeight > vh - margin) {
      const aboveTop = rect.top - estimatedHeight - margin;
      if (aboveTop >= margin) {
        top = aboveTop;
      } else {
        top = Math.max(margin, vh - estimatedHeight - margin);
      }
    }
    setStyle({ top: `${top}px`, left: `${left}px`, width: '34rem' });
  }, [showPIFiltersPanel, productosIntermedios]);

  if (!showPIFiltersPanel) return null;

  const toggleUnidad = (unidad: string) => {
    setSelectedUnidadesProduccion((prev) =>
      prev.includes(unidad)
        ? prev.filter((u) => u !== unidad)
        : [...prev, unidad],
    );
  };
  const toggleCategoria = (cat: string) => {
    setSelectedCategoriasIntermedio((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat],
    );
  };
  const clearAll = () => {
    setSelectedUnidadesProduccion([]);
    setSelectedCategoriasIntermedio([]);
    setProductosIntermediosSearchTerm('');
  };

  return (
    <div
      id="pi-filters-panel"
      style={style}
      className="fixed z-50 bg-gradient-to-br from-white via-white to-indigo-50/60 backdrop-blur-sm shadow-[0_4px_24px_-4px_rgba(0,0,0,0.15)] border border-gray-200/70 rounded-xl p-5 flex flex-col gap-5 animate-fade-in max-h-[min(80vh,520px)] overflow-hidden ring-1 ring-black/5"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col">
          <h3 className="font-semibold font-[Roboto] text-gray-800 text-lg tracking-tight flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Filtros
          </h3>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mt-1">
            Refina productos intermedios
          </p>
        </div>
        <button
          onClick={() => setShowPIFiltersPanel(false)}
          className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:border-gray-500 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          Cerrar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6 overflow-auto pr-1 custom-scrollbar">
        <div className="flex flex-col gap-2">
          <p className="font-medium text-[13px] text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded bg-indigo-400" /> Unidad Producción
          </p>
          <div className="flex flex-col gap-1 rounded-lg bg-white/70 border border-gray-200 p-2 max-h-48 overflow-auto custom-scrollbar shadow-sm">
            {opcionesUnidades.map((u) => (
              <label
                key={u}
                className="group flex items-center gap-2 text-[12px] cursor-pointer rounded-md px-2 py-1 hover:bg-indigo-50/70 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedUnidadesProduccion.includes(u)}
                  onChange={() => toggleUnidad(u)}
                  className="accent-indigo-600 w-3.5 h-3.5 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-gray-700 group-hover:text-gray-900 truncate">
                  {u}
                </span>
              </label>
            ))}
            {opcionesUnidades.length === 0 && (
              <p className="text-[11px] text-gray-400 px-2 py-1">Sin datos</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-medium text-[13px] text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded bg-emerald-400" /> Categoría
          </p>
          <div className="flex flex-col gap-1 rounded-lg bg-white/70 border border-gray-200 p-2 max-h-48 overflow-auto custom-scrollbar shadow-sm">
            {opcionesCategorias.map((c) => (
              <label
                key={c}
                className="group flex items-center gap-2 text-[12px] cursor-pointer rounded-md px-2 py-1 hover:bg-emerald-50/70 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoriasIntermedio.includes(c)}
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
          {selectedUnidadesProduccion.map((u) => (
            <span
              key={u}
              className="group text-[11px] bg-gradient-to-r from-indigo-500/15 to-indigo-600/20 text-indigo-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-300/40 hover:border-indigo-400/70 backdrop-blur-sm"
            >
              <span className="truncate max-w-[120px]">{u}</span>
              <button
                onClick={() => toggleUnidad(u)}
                className="text-[10px] font-bold leading-none hover:text-indigo-900 transition-colors"
                aria-label={`Eliminar filtro unidad ${u}`}
              >
                ×
              </button>
            </span>
          ))}
          {selectedCategoriasIntermedio.map((c) => (
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
          {selectedUnidadesProduccion.length === 0 &&
            selectedCategoriasIntermedio.length === 0 && (
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
            onClick={() => setShowPIFiltersPanel(false)}
            className="text-xs px-4 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-600/30 transition-colors cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
