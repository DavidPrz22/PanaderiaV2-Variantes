import { getRecetaDetalles, getRecetas, getProductosElaborados, getComponentesRecetas, getRecetasSearch } from "../../api/api";
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

export const productosElaboradosQueryOptions = (searchTerm: string) => {
  return {
    queryKey: ["search", searchTerm],
    queryFn: () => getProductosElaborados(searchTerm),
    staleTime: Infinity,
    enabled: searchTerm.length > 2,
  };
};

export const componentesRecetasQueryOptions = (searchTerm: string) => {
  return {
    queryKey: ["search", searchTerm],
    queryFn: () => getComponentesRecetas(searchTerm),
    staleTime: Infinity,
    enabled: searchTerm.length > 2,
  };
};


export const recetasSearchQueryOptions = (searchTerm: string, recetaId?: number) => {
  return {
    queryKey: ["search", searchTerm, recetaId],
    queryFn: () => getRecetasSearch(searchTerm, recetaId),
    staleTime: Infinity,
    enabled: searchTerm.length > 2,
  };
};
