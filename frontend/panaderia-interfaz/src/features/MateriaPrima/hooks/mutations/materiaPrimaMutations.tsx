import { useMutation } from "@tanstack/react-query";

import {
  handleChangeLoteMateriaPrimaStatus,
  handleDeleteLoteMateriaPrima,
  handleDeleteMateriaPrima,
  handleCreateUpdateLoteMateriaPrima,
  handleCreateUpdateMateriaPrima,
  uploadYAML
} from "../../api/api";

import {
  createMateriaPrimaListQueryOptions,
  createMateriaPrimaListPKQueryOptions,
  lotesMateriaPrimaQueryOptions,
} from "../../hooks/queries/materiaPrimaQueryOptions";

import { useQueryClient } from "@tanstack/react-query";

import type { TLoteMateriaPrimaSchema, TMateriaPrimaSchema } from "../../schemas/schemas";

import type { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { setErrorForm } from "../../utils/util";

export const useDeleteMateriaPrimaMutation = (
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => handleDeleteMateriaPrima(id),
    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: createMateriaPrimaListQueryOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: createMateriaPrimaListPKQueryOptions(id)
            .queryKey,
        }),
      ]);
    },
  });
};

export const useCreateUpdateMateriaPrimaMutation = (
  setError: UseFormSetError<TMateriaPrimaSchema>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, id }: { data: TMateriaPrimaSchema; id?: number }) => handleCreateUpdateMateriaPrima(data, id),
    onSuccess: async (data) => {

      toast.success("Materia Prima creada exitosamente");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: createMateriaPrimaListQueryOptions().queryKey,
        }),
        queryClient.setQueryData(
          createMateriaPrimaListPKQueryOptions(data.id).queryKey,
          data,
        ),
      ]);
    },
    onError: (error: {
      failed: boolean;
      errorData: Record<string, string[]>;
    }) => {
      setErrorForm(setError, error);
    },
  });
};


// Lotes Materia Prima
export const useDeleteLoteMateriaPrimaMutation = (
  materiaPrimaId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await handleDeleteLoteMateriaPrima(id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: createMateriaPrimaListQueryOptions().queryKey }),

        queryClient.invalidateQueries({
          queryKey: createMateriaPrimaListPKQueryOptions(materiaPrimaId).queryKey,
        }),

        queryClient.invalidateQueries({
          queryKey: lotesMateriaPrimaQueryOptions(materiaPrimaId).queryKey,
        })
      ])
    },
  });
};


export const useUpdateLoteStatusMateriaPrimaMutation = (
  materiaPrimaId: number,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: "ACTIVAR" | "INACTIVAR" }) =>
      handleChangeLoteMateriaPrimaStatus(id, action),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: lotesMateriaPrimaQueryOptions(materiaPrimaId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: createMateriaPrimaListPKQueryOptions(materiaPrimaId).queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: createMateriaPrimaListQueryOptions().queryKey }),
      ])
    },
  });
};

export const useCreateUpdateLoteMateriaPrimaMutation = (
  materia_prima_id: number,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }: { data: TLoteMateriaPrimaSchema, id?: number }) =>
      handleCreateUpdateLoteMateriaPrima(
        data,
        id,
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: createMateriaPrimaListPKQueryOptions(materia_prima_id).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: createMateriaPrimaListQueryOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: lotesMateriaPrimaQueryOptions(materia_prima_id).queryKey,
        })
      ])
    },
  });
};


export const useImportYAMLMutationMateriaPrima = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: string) => uploadYAML(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: createMateriaPrimaListQueryOptions().queryKey,
      });
    },
  })
}