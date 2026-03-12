import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  productoFinalDetallesQueryOptions,
  productosFinalesQueryOptions,
  lotesProductosFinalesQueryOptions,
} from "./productosFinalesQueryOptions";

export const useGetProductosFinales = () => {
  return useInfiniteQuery(productosFinalesQueryOptions);
};

export const useProductoFinalDetalles = (id: number) => {
  return useQuery({
    ...productoFinalDetallesQueryOptions(id),
    enabled: !!id,
  });
};

export const useGetLotesProductosFinales = (id: number) => {
  return useInfiniteQuery(lotesProductosFinalesQueryOptions(id));
};