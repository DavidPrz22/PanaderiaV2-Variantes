import { fetchCategoriasMateriaPrima, fetchUnidadesMedida, fetchProveedores } from "@/api/api";

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