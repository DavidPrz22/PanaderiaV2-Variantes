import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteReceta,
  registerUpdateReceta,
} from "../../api/api";

import { useRecetasContext } from "@/context/RecetasContext";
import type { TRecetaSchema } from "../../schemas/schemas";

import {
  recetasDetallesQueryOptions,
  recetasQueryOptions,
} from "../queries/RecetasQueryOptions";

import type { QueryClient } from "@tanstack/react-query";
import type { RecetasPagination } from "../../types/types";



export const useRegisterUpdateRecetaMutation = () => {
  const { setComponentesListadosReceta, setRecetasListadas } =
    useRecetasContext();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, id }: { data: TRecetaSchema, id?: number }) => {
      if (id) {
        return registerUpdateReceta(data, id);
      }
      return registerUpdateReceta(data);
    },
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: recetasQueryOptions.queryKey,
      });

      if (id) await queryClient.invalidateQueries({
        queryKey: recetasDetallesQueryOptions(id).queryKey,
      });


      setComponentesListadosReceta([]);
      setRecetasListadas([]);
    },
  });
};

type PageData = {
  pages: RecetasPagination[],
  pageParams: (string | null)[]
}

const invalidatePage = async (page: number, queryClient: QueryClient) => {
  const pageOption = recetasQueryOptions.queryKey;

  // Retrieve the current infinite query data
  const data = queryClient.getQueryData<PageData>(pageOption);
  if (!data) return;

  const currentPageParam = data.pageParams[page];

  // Fetch the specific page data without overwriting the main cache key immediately
  // We use a temporary key or just call the function directly to avoid cache collisions
  const invalidatedPageData = await queryClient.fetchQuery({
    queryKey: [...pageOption, "page", page],
    queryFn: () => recetasQueryOptions.queryFn({ pageParam: currentPageParam }),
    staleTime: 0,
  });

  // Immutably update the cache
  queryClient.setQueryData<PageData>(pageOption, (oldData) => {
    if (!oldData) return undefined;

    const newPages = [...oldData.pages];
    if (newPages[page]) {
      newPages[page] = invalidatedPageData;
    }

    return {
      ...oldData,
      pages: newPages,
    };
  });
};



export const useDeleteRecetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recetaId: number) => deleteReceta(recetaId),
    onSuccess: async (_, recetaId) => {
      await queryClient.invalidateQueries({
        queryKey: recetasQueryOptions.queryKey,
      });
      queryClient.removeQueries({
        queryKey: recetasDetallesQueryOptions(recetaId).queryKey,
      });
    },
  });
};
