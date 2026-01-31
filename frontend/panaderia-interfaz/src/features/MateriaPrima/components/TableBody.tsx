import { DoubleSpinner } from "@/assets";

import type { TMateriaPrimaList } from "../schemas/zod-types";

import { TableRows } from "./TableRows";

type TableBody = {
  currentPageData: TMateriaPrimaList[];
  isMateriaPrimaListFetching: Boolean;
}

export const TableBody = ({ currentPageData, isMateriaPrimaListFetching }: TableBody) => {

  // Get display data considering filters

  // If no filters applied, return current page data
  const displayData = currentPageData.length > 0 ? currentPageData : null;

  const displayDataSorted = displayData?.sort((a, b) => a.id - b.id);

  const NoDataMessage = () => (
    <div className="flex justify-center h-full items-center font-bold text-2xl text-gray-700">
      No hay datos Registrados
    </div>
  );

  return (
    <>
      {isMateriaPrimaListFetching ? (
        <div className="flex justify-center h-full font-bold text-2xl text-black items-center">
          <img src={DoubleSpinner} alt="Cargando..." className="size-28" />
          <span className="ml-2">Cargando...</span>
        </div>
      ) : displayDataSorted ? (
        <TableRows data={displayDataSorted} />
      ) : (
        <NoDataMessage />
      )}
    </>
  );
};
