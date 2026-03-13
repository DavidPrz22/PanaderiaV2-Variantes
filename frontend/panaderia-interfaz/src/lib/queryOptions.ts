import { fetchCategoriasMateriaPrima, fetchUnidadesMedida, fetchProveedores, fetchAtributosProducto, fetchCategoriasProductoIntermedio, fetchCategoriasProductoFinal, fetchCategoriasProductoReventa } from "@/api/api";

export const createUnidadesQueryOptions = () => ({
  queryKey: ["unidadesMedida"],
  queryFn: fetchUnidadesMedida,
  staleTime: Infinity,
});

export const createCategoriasQueryOptions = () => ({
  queryKey: ["categoriasMateriaPrima"],
  queryFn: fetchCategoriasMateriaPrima,
  staleTime: Infinity,
});

export const createProveedoresQueryOptions = () => ({
  queryKey: ["proveedores"],
  queryFn: fetchProveedores,
  staleTime: Infinity,
});

export const createAtributosProductoQueryOptions = () => ({
  queryKey: ["atributosProducto"],
  queryFn: fetchAtributosProducto,
  staleTime: Infinity,
});

export const createCategoriasProductoIntermedioQueryOptions = () => ({
  queryKey: ["categoriasProductoIntermedio"],
  queryFn: fetchCategoriasProductoIntermedio,
  staleTime: Infinity,
});



export const createCategoriasProductoFinalQueryOptions = () => ({
  queryKey: ["categoriasProductoFinal"],
  queryFn: fetchCategoriasProductoFinal,
  staleTime: Infinity,
});

export const createCategoriasProductoReventaQueryOptions = () => ({
  queryKey: ["categoriasProductoReventa"],
  queryFn: fetchCategoriasProductoReventa,
  staleTime: Infinity,
});