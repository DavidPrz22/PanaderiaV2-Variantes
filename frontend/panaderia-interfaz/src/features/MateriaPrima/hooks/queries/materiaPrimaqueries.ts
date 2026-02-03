import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createMateriaPrimaListQueryOptions, lotesMateriaPrimaQueryOptions, createMateriaPrimaListPKQueryOptions } from "./materiaPrimaQueryOptions";

export const useGetMateriaPrima = () => {
  return useInfiniteQuery(createMateriaPrimaListQueryOptions());
};

export const useLotesMateriaPrimaQuery = (
  materiaprimaId: number,
  showMateriaprimaDetalles: boolean,
) => {
  return useInfiniteQuery({
    ...lotesMateriaPrimaQueryOptions(materiaprimaId),
    enabled: !!materiaprimaId && showMateriaprimaDetalles,
  });
};


export const useMateriaPrimaDetallesQuery = (id: number, enabled: boolean = true) => {
  const queryOptions = createMateriaPrimaListPKQueryOptions(id);
  return useQuery({
    ...queryOptions,
    enabled: enabled && !!id,
  });
};