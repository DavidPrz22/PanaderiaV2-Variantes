import {
  getProveedores,
  getOrdenesComprasTable,
  getOrdenesComprasDetalles,
  getBCVRate,
  getAllEstadosOrdenCompra,
  getMetodosDePago,
  getEstadosOrdenCompraRegistro,
  getUnidadesMedida,
  searchProductosOC,
} from "../../api/api";

import type { OrdenesCompraPagination } from "../../types/types";

export const proveedoresQueryOptions = {
  queryKey: ["proveedores"],
  queryFn: getProveedores,
  staleTime: Infinity,
};

export const ordenesCompraTableQueryOptions = {
  queryKey: ["ordenes-compra-table"],
  queryFn: getOrdenesComprasTable,
  initialPageParam: null,
  getNextPageParam: (lastPage: OrdenesCompraPagination) => lastPage.next,
  getPreviousPageParam: (firstPage: OrdenesCompraPagination) =>
    firstPage.previous,
  staleTime: Infinity,
};

export const ordenesCompraDetallesQueryOptions = (id: number) => {
  return {
    queryKey: ["ordenes-compra-detalles", id],
    queryFn: () => getOrdenesComprasDetalles(id),
    staleTime: Infinity,
  };
};

export const metodosDePagoQueryOptions = {
  queryKey: ["metodos-de-pago"],
  queryFn: getMetodosDePago,
  staleTime: Infinity,
};

export const bcvRateQueryOptions = {
  queryKey: ["bcv-rate"],
  queryFn: getBCVRate,
  staleTime: Infinity,
};

export const estadosOrdenCompraQueryOptions = {
  queryKey: ["estados-orden-compra"],
  queryFn: getAllEstadosOrdenCompra,
  staleTime: Infinity,
};

export const estadosOrdenCompraRegistroQueryOptions = {
  queryKey: ["estados-orden-compra-registro"],
  queryFn: getEstadosOrdenCompraRegistro,
  staleTime: Infinity,
};

export const unidadesMedidaQueryOptions = {
  queryKey: ["unidades-medida"],
  queryFn: getUnidadesMedida,
  staleTime: Infinity,
};

export const searchProductosOCQueryOptions = (search: string) => ({
  queryKey: ["productos-compras-search", search],
  queryFn: () => searchProductosOC(search),
  staleTime: Infinity,
});
