import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteReceta,
  registerUpdateReceta,
  generarRecetas,
} from "../../api/api";

import { useRecetasContext } from "@/context/RecetasContext";
import type { TRecetaSchema } from "../../schemas/schemas";

import {
  recetasDetallesQueryOptions,
  recetasQueryOptions,
} from "../queries/RecetasQueryOptions";

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

export const useGenerarRecetasMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generarRecetas(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: recetasQueryOptions.queryKey,
      });
    },
  });
};
