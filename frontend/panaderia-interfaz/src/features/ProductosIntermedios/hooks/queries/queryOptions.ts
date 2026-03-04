import {
  getLotesProductosIntermedios,
  getProductosIntermedios,
  getProductosIntermediosDetalles,
} from "../../api/api";
import type { LoteProductoIntermedioPagination, ProductosIntermediosPagination } from "../../types/types";


export const productosIntermediosQueryOptions = {
  queryKey: ["productos-intermedios"],
  queryFn: ({ pageParam }: { pageParam?: string | null }) =>
    getProductosIntermedios({ pageParam }),
  staleTime: Infinity,
  initialPageParam: null,
  getNextPageParam: (lastPage: ProductosIntermediosPagination) => lastPage.next,
  getPreviousPageParam: (firstPage: ProductosIntermediosPagination) => firstPage.previous,
};

export const productosIntermediosDetallesQueryOptions = (id: number) => ({
  queryKey: ["productos-intermedios-detalles", id],
  queryFn: () => getProductosIntermediosDetalles(id),
  staleTime: Infinity,
});

export const lotesProductosIntermediosQueryOptions = (producto_intermedio_id?: number) => ({
  queryKey: ["lotes-productos-intermedios-paginated", producto_intermedio_id],
  queryFn: ({ pageParam }: { pageParam?: string | null }) =>
    getLotesProductosIntermedios({ pageParam, producto_intermedio_id }),
  staleTime: Infinity,
  initialPageParam: null,
  getNextPageParam: (lastPage: LoteProductoIntermedioPagination) => lastPage.next,
  getPreviousPageParam: (firstPage: LoteProductoIntermedioPagination) => firstPage.previous,
});