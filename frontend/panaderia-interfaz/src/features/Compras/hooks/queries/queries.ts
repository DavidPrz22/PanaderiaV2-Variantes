import {useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  ordenesCompraTableQueryOptions,
} from "./queryOptions";
import {
  estadosOrdenCompraQueryOptions,
  estadosOrdenCompraRegistroQueryOptions,
  ordenesCompraDetallesQueryOptions,
  searchProductosOCQueryOptions,
} from "./queryOptions";

export const useGetOrdenesCompraTable = () => {
  return useInfiniteQuery(ordenesCompraTableQueryOptions);
};

export const useGetAllEstadosOrdenCompra = () => {
  return useQuery(estadosOrdenCompraQueryOptions);
};

export const useGetEstadosOrdenCompraRegistro = () => {
  return useQuery(estadosOrdenCompraRegistroQueryOptions);
};

export const useGetOrdenesCompraDetalles = (id: number) => {
  return useQuery({ ...ordenesCompraDetallesQueryOptions(id), enabled: !!id });
};

export const useSearchProductosOC = (search: string) => {
  return useQuery(searchProductosOCQueryOptions(search));
};
