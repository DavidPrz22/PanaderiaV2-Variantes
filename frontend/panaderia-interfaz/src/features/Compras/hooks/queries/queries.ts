import { useQueries, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  bcvRateQueryOptions,
  ordenesCompraTableQueryOptions,
} from "./queryOptions";
import {
  estadosOrdenCompraQueryOptions,
  proveedoresQueryOptions,
  metodosDePagoQueryOptions,
  estadosOrdenCompraRegistroQueryOptions,
  ordenesCompraDetallesQueryOptions,
  unidadesMedidaQueryOptions,
  searchProductosOCQueryOptions,
} from "./queryOptions";

export const useGetOrdenesCompraTable = () => {
  return useInfiniteQuery(ordenesCompraTableQueryOptions);
};

export const useGetAllEstadosOrdenCompra = () => {
  return useQuery(estadosOrdenCompraQueryOptions);
};

export const useGetParametros = () => {
  return useQueries({
    queries: [
      proveedoresQueryOptions,
      metodosDePagoQueryOptions,
      unidadesMedidaQueryOptions,
    ],
  });
};

export const useGetEstadosOrdenCompraRegistro = () => {
  return useQuery(estadosOrdenCompraRegistroQueryOptions);
};

export const useGetBCVRate = () => {
  return useQuery(bcvRateQueryOptions);
};

export const useGetOrdenesCompraDetalles = (id: number) => {
  return useQuery({ ...ordenesCompraDetallesQueryOptions(id), enabled: !!id });
};

export const useSearchProductosOC = (search: string) => {
  return useQuery(searchProductosOCQueryOptions(search));
};
