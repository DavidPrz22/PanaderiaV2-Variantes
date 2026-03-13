import { PRTableRows } from "./PRTableRows";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
import type { ProductosReventa } from "../types/types";

interface PRTableBodyProps {
  data: ProductosReventa[];
  isFetching: boolean;
  anyFilterActive: boolean;
  clearFilters: () => void;
  isTrulyEmpty: boolean;
}

export const PRTableBody = ({
  data,
  isFetching,
  anyFilterActive,
  clearFilters,
  isTrulyEmpty,
}: PRTableBodyProps) => {

  const EmptyState = () => {
    if (isTrulyEmpty) {
      return (
        <div className="flex flex-col gap-2 justify-center h-full items-center text-center text-gray-600 py-16">
          <p className="font-semibold text-lg">No hay datos registrados</p>
          <p className="text-sm text-gray-500 max-w-sm">
            Registra un producto de reventa para comenzar.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3 justify-center h-full items-center text-center text-gray-600 py-16">
        <p className="font-semibold text-lg">Sin resultados</p>
        <p className="text-sm text-gray-500 max-w-sm">
          No hay coincidencias con los filtros o la búsqueda aplicada.
        </p>
        {anyFilterActive && (
          <button
            onClick={clearFilters}
            className="text-xs px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
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
      ) : data.length > 0 ? (
        <PRTableRows data={data} />
      ) : (
        <EmptyState />
      )}
    </>
  );
};