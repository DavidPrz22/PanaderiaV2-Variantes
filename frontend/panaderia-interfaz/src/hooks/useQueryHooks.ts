import { useQuery } from "@tanstack/react-query";

import { 
    createUnidadesQueryOptions, 
    createCategoriasQueryOptions,
    createProveedoresQueryOptions 
} from "../lib/queryOptions";


export const useUnidadesMedidaQuery = () => {
  return useQuery(createUnidadesQueryOptions());
}

export const useCategoriasQuery = () => {
  return useQuery(createCategoriasQueryOptions());
}

export const useProveedoresQuery = () => {
  return useQuery(createProveedoresQueryOptions());
}