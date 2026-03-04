import { getRecetaDetalles, getRecetas } from "../../api/api";
import type { RecetasPagination } from "../../types/types";

export const recetasQueryOptions = {
  queryKey: ["recetas"],
  queryFn: ({ pageParam }: { pageParam?: string | null }) =>
    getRecetas({ pageParam }),
  staleTime: Infinity,
  initialPageParam: null,
  getNextPageParam: (lastPage: RecetasPagination) => lastPage.next,
  getPreviousPageParam: (firstPage: RecetasPagination) => firstPage.previous,
};

export const recetasDetallesQueryOptions = (id: number | null) => {
  return {
    queryKey: ["recetasDetalles", id],
    queryFn: () => (id ? getRecetaDetalles(id) : undefined),
    staleTime: Infinity,
  };
};
