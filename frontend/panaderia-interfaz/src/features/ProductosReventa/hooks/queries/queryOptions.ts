import {
  getLotesProductosReventa,
  getProductosReventa,
  getProductosReventaDetalles,
  getProveedores,
} from "../../api/api";
import { fetchCategoriasProductoReventa, fetchUnidadesMedida } from "@/api/api";
import type { LoteProductoReventaPagination, ProductosReventaPagination } from "../../types/types";

export const unidadesMedidaQueryOptions = {
  queryKey: ["unidadesMedida"],
  queryFn: fetchUnidadesMedida,
  staleTime: Infinity,
};

export const categoriasProductosReventaQueryOptions = {
  queryKey: ["categoriasProductoReventa"],
  queryFn: fetchCategoriasProductoReventa,
  staleTime: Infinity,
};

export const proveedoresQueryOptions = {
  queryKey: ["proveedores"],
  queryFn: getProveedores,
  staleTime: Infinity,
};

export const productosReventaQueryOptions = {
  queryKey: ["productos-reventa"],
  queryFn: ({ pageParam }: { pageParam?: string | null }) =>
    getProductosReventa({ pageParam }),
  staleTime: Infinity,
  initialPageParam: null,
  getNextPageParam: (lastPage: ProductosReventaPagination) => lastPage.next,
  getPreviousPageParam: (firstPage: ProductosReventaPagination) => firstPage.previous,
};


export const PRODUCTOS_REVENTA_KEY = ["productos-reventa"];
export const productosReventaDetallesQueryOptions = (id: number) => ({
  queryKey: ["productos-reventa-detalles", id],
  queryFn: () => getProductosReventaDetalles(id),
  staleTime: Infinity,
});

export const lotesProductosReventaQueryOptions = (producto_reventa_id?: number) => ({
  queryKey: ["lotes-productos-reventa-paginated", producto_reventa_id],
  queryFn: ({ pageParam }: { pageParam?: string | null }) =>
    getLotesProductosReventa({ pageParam, producto_reventa_id }),
  staleTime: Infinity,
  initialPageParam: null,
  getNextPageParam: (lastPage: LoteProductoReventaPagination) => lastPage.next,
  getPreviousPageParam: (firstPage: LoteProductoReventaPagination) => firstPage.previous,
});
