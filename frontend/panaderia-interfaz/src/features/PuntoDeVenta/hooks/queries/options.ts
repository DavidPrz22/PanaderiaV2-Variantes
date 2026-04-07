import { checkIsActive, BCVRate, getProductos, getCategorias } from "../../api/api"

export const isActiveCajaOptions = {
    queryKey: ['is-active-caja'],
    queryFn: () => checkIsActive(),
    staleTime: Infinity
}

export const bcvRateOptions = {
  queryKey: ["bcv-rate"],
  queryFn: BCVRate,
  staleTime: Infinity,
};


export const productosQueryOptions = {
  queryKey: ["productos"],
  queryFn: getProductos,
  staleTime: Infinity,
};

export const categoriasQueryOptions = {
  queryKey: ["categorias"],
  queryFn: getCategorias,
  staleTime: Infinity,
};