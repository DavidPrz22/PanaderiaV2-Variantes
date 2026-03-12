import { queryOptions } from "@tanstack/react-query";
import {
  getProductoFinalDetalles,
  getProductosFinales,
  getLotesProductosFinales,
} from "../../api/api";
import type { LoteProductoFinalPagination, ProductosFinalesPagination } from "../../types/types";

export const productoFinalDetallesQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["DetallesProductoFinal", id],
    queryFn: () => getProductoFinalDetalles(id),
    staleTime: Infinity,
  });

export const productosFinalesQueryOptions = {
  queryKey: ["productosFinales"],
  queryFn: ({ pageParam }: { pageParam?: string | null }) =>
    getProductosFinales({ pageParam }),
  staleTime: Infinity,
  initialPageParam: null,
  getNextPageParam: (lastPage: ProductosFinalesPagination) => lastPage.next,
  getPreviousPageParam: (firstPage: ProductosFinalesPagination) => firstPage.previous,
};


export const lotesProductosFinalesQueryOptions = (producto_final_id?: number) => ({
  queryKey: ["lotes-productos-finales-paginated", producto_final_id],
  queryFn: ({ pageParam }: { pageParam?: string | null }) =>
    getLotesProductosFinales({ pageParam, producto_final_id }),
  staleTime: Infinity,
  initialPageParam: null,
  getNextPageParam: (lastPage: LoteProductoFinalPagination) => lastPage.next,
  getPreviousPageParam: (firstPage: LoteProductoFinalPagination) => firstPage.previous,
});