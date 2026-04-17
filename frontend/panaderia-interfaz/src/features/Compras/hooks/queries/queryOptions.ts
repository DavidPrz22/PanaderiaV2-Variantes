import {
  getOrdenesComprasTable,
  getOrdenesComprasDetalles,
  getAllEstadosOrdenCompra,
  getEstadosOrdenCompraRegistro,
  searchProductosOC,
} from "../../api/api";

import type { OrdenesCompraPagination } from "../../types/types";



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


export const searchProductosOCQueryOptions = (search: string) => ({
  queryKey: ["productos-compras-search", search],
  queryFn: () => searchProductosOC(search),
  enabled: !!search.length && search.length > 2,
  staleTime: Infinity,

});
