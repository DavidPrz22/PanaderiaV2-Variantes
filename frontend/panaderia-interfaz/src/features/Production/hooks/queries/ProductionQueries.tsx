import { useQueries, useQuery } from "@tanstack/react-query";
import {
  finalesSearchOptions,
  intermediosSearchOptions,
  productionDetailsOptions,
} from "./ProductionQueryOptions";
import { componentsProductionOptions } from "./ProductionQueryOptions";
import { useProductionContext } from "@/context/ProductionContext";

export const useProductSearchQueries = () => {
  return useQueries({
    queries: [finalesSearchOptions, intermediosSearchOptions],
  });
};

export const useComponentsProductionQuery = () => {
  const { productoId } = useProductionContext();

  return useQuery({
    ...componentsProductionOptions(productoId!),
    enabled: !!productoId,
  });
};

export const useProductionDetailsQuery = () => {
  const { detailPage } = useProductionContext();
  return useQuery({
    ...productionDetailsOptions(detailPage),
  });
};