import { useQuery } from "@tanstack/react-query";
import { bcvRateOptions, isActiveCajaOptions, categoriasQueryOptions, productosQueryOptions } from "./options";

export const useIsActiveCajaQuery = () => {
    return useQuery(isActiveCajaOptions);
}

export const useBCVRateQuery = () => {
    return useQuery(bcvRateOptions);
}

export const useCategoriasQuery = () => {
    return useQuery(categoriasQueryOptions);
}

export const useProductosQuery = () => {
    return useQuery(productosQueryOptions);
}