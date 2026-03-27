import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  recetasDetallesQueryOptions,
  recetasQueryOptions,
  productosElaboradosQueryOptions,
  componentesRecetasQueryOptions,
  recetasSearchQueryOptions,
} from "./RecetasQueryOptions";

export const useRecetasQuery = () => {
  return useInfiniteQuery(recetasQueryOptions);
};

export const useRecetaDetallesQuery = (id: number) => {
  return useQuery({
    ...recetasDetallesQueryOptions(id),
    enabled: !!id,
  });
};

export const useGetProductosElaboradosQuery = (searchTerm: string) => {
  return useQuery(productosElaboradosQueryOptions(searchTerm));
};

export const useGetComponentesRecetasQuery = (searchTerm: string) => {
  return useQuery(componentesRecetasQueryOptions(searchTerm));
};

export const useGetRecetasSearchQuery = (searchTerm: string, recetaId?: number) => {
  return useQuery(recetasSearchQueryOptions(searchTerm, recetaId));
};