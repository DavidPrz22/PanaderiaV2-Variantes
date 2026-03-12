import { PFTableRows } from "./PFTablerows";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
import type { ProductoFinal } from "../types/types";

interface PFTableBodyProps {
  displayData: ProductoFinal[];
  isFetching: boolean;
  hasData: boolean;
  anyFilterActive: boolean;
  onClearFilters: () => void;
}

export const PFTableBody = ({
  displayData,
  isFetching,
  hasData,
  anyFilterActive,
  onClearFilters,
}: PFTableBodyProps) => {
  const EmptyState = () => {
    if (!hasData) {
      return (
        <div className="flex flex-col gap-2 justify-center h-full items-center text-center text-gray-600 py-16">
          <p className="font-semibold text-lg">No hay datos registrados</p>
          <p className="text-sm text-gray-500 max-w-sm">
            Aún no se han cargado productos finales. Registra uno nuevo para comenzar.
          </p>
        </div>
      );
    }
    // There is base data, but filters/search produced zero results
    return (
      <div className="flex flex-col gap-3 justify-center h-full items-center text-center text-gray-600 py-16">
        <p className="font-semibold text-lg">Sin resultados</p>
        <p className="text-sm text-gray-500 max-w-sm">
          No hay coincidencias con los filtros o la búsqueda aplicada.
        </p>
        {anyFilterActive && (
          <button
            onClick={onClearFilters}
            className="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {isFetching ? (
        <PendingTubeSpinner
          size={28}
          extraClass="absolute bg-white opacity-50 w-full h-[80%]"
        />
      ) : displayData.length > 0 ? (
        <PFTableRows data={displayData} />
      ) : (
        <EmptyState />
      )}
    </>
  );
};

