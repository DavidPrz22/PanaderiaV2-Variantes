import { queryOptions } from "@tanstack/react-query";
import {
  getRecetaComponentes,
  getProductionDetails,
  searchProductosFinales,
  searchProductosIntermedios,
} from "../../api/api";

export const finalesSearchOptions = {
  queryKey: ["productosFinalesSearch"],
  queryFn: searchProductosFinales,
  staleTime: Infinity,
};

export const intermediosSearchOptions = {
  queryKey: ["productosIntermediosSearch"],
  queryFn: searchProductosIntermedios,
  staleTime: Infinity,
};

export const COMPONENTES_PRODUCCION = "componentesProduccion"

export const componentsProductionOptions = (id: number) => {
  return {
    queryKey: [COMPONENTES_PRODUCCION, id],
    queryFn: () => getRecetaComponentes(id),
    staleTime: Infinity,
    retry: false,
  };
};

export const productionDetailsOptions = (page: number) => {
  return queryOptions({
    queryKey: ["productionDetails", page],
    queryFn: () => getProductionDetails(page),
    staleTime: Infinity,
  });
};