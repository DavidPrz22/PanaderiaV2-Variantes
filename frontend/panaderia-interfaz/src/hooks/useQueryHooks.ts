import { useQuery } from "@tanstack/react-query";

import {
  createUnidadesQueryOptions,
  createCategoriasQueryOptions,
  createProveedoresQueryOptions,
  createAtributosProductoQueryOptions,
  createCategoriasProductoIntermedioQueryOptions,
  createCategoriasProductoFinalQueryOptions,
  createCategoriasProductoReventaQueryOptions,
  createClientesPOSQueryOptions,
  createBCVRateQueryOptions,
  createMetodosDePagoQueryOptions,
  createEmpaquetadoProductosQueryOptions
} from "../lib/queryOptions";
import { recetasDetallesQueryOptions } from "@/features/Recetas/hooks/queries/RecetasQueryOptions";


export const useUnidadesMedidaQuery = () => {
  return useQuery(createUnidadesQueryOptions());
}

export const useCategoriasQuery = () => {
  return useQuery(createCategoriasQueryOptions());
}

export const useProveedoresQuery = () => {
  return useQuery(createProveedoresQueryOptions());
}

export const useAtributosProductoQuery = () => {
  return useQuery(createAtributosProductoQueryOptions());
}

export const useCategoriasProductoIntermedioQuery = () => {
  return useQuery(createCategoriasProductoIntermedioQueryOptions());
}

export const useRecetasQuery = (recetaId: number | null, showRecipeModal: boolean) => {
  return useQuery({
    ...recetasDetallesQueryOptions(recetaId),
    enabled: !!recetaId && showRecipeModal,
  });
}

export const useCategoriasProductoFinalQuery = () => {
  return useQuery(createCategoriasProductoFinalQueryOptions());
}

export const useCategoriasProductoReventaQuery = () => {
  return useQuery(createCategoriasProductoReventaQueryOptions());
}

export const useClientesPOSQuery = () => {
  return useQuery(createClientesPOSQueryOptions());
}

export const useBCVRateQuery = () => {
  return useQuery(createBCVRateQueryOptions());
} 

export const useMetodosDePagoQuery = () => {
  return useQuery(createMetodosDePagoQueryOptions());
}

export const useEmpaquetadoProductosQuery = () => {
  return useQuery(createEmpaquetadoProductosQueryOptions());
}