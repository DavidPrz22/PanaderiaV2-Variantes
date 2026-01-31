import { useMutation } from "@tanstack/react-query";

import {
  handleActivateLoteMateriaPrima,
  handleInactivateLoteMateriaPrima,
  handleDeleteLoteMateriaPrima,
  handleDeleteMateriaPrima,
  handleCreateUpdateLoteMateriaPrima,
  handleCreateUpdateMateriaPrima,
  uploadCSV
} from "../../api/api";

import {
  createLotesMateriaPrimaQueryOptions,
  createMateriaPrimaListQueryOptions,
  createMateriaPrimaListPKQueryOptions,
  lotesMateriaPrimaQueryOptions,
} from "../../hooks/queries/materiaPrimaQueryOptions";


import { useQueryClient } from "@tanstack/react-query";

import type {
  LoteMateriaPrimaFormSumit,
} from "../../types/types";

import type { TMateriaPrimaSchema } from "../../schemas/schemas";

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
  materiaprimaId: number | undefined,
  handleClose: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await handleDeleteLoteMateriaPrima(id);
    },
    onSuccess: async () => {
      if (materiaprimaId) {
        await queryClient.invalidateQueries({
          queryKey:
            createLotesMateriaPrimaQueryOptions(materiaprimaId).queryKey,
        });
        await queryClient.invalidateQueries({ queryKey: createMateriaPrimaListQueryOptions().queryKey });
        await queryClient.invalidateQueries({
          queryKey: createMateriaPrimaListPKQueryOptions(materiaprimaId).queryKey,
        });
        await queryClient.invalidateQueries({
          queryKey: lotesMateriaPrimaQueryOptions(materiaprimaId).queryKey,
        })
        handleClose();
      }
    },
  });
};

export const useActivateLoteMateriaPrimaMutation = (
  materiaPrimaId: number | undefined,
  handleClose: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => handleActivateLoteMateriaPrima(id),
    onSuccess: () => {
      handleClose();
      if (materiaPrimaId) {
        queryClient.invalidateQueries({
          queryKey:
            createLotesMateriaPrimaQueryOptions(materiaPrimaId).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: lotesMateriaPrimaQueryOptions(materiaPrimaId).queryKey,
        })
      }
      queryClient.invalidateQueries({ queryKey: createMateriaPrimaListQueryOptions().queryKey });
    },
  });
};

export const useInactivateLoteMateriaPrimaMutation = (
  materiaPrimaId: number | undefined,
  handleClose: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => handleInactivateLoteMateriaPrima(id),
    onSuccess: () => {
      handleClose();
      if (materiaPrimaId) {
        queryClient.invalidateQueries({
          queryKey:
            createLotesMateriaPrimaQueryOptions(materiaPrimaId).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: lotesMateriaPrimaQueryOptions(materiaPrimaId).queryKey,
        })
        queryClient.invalidateQueries({ queryKey: createMateriaPrimaListQueryOptions().queryKey });
      }
    },
  });
};

export const useCreateUpdateLoteMateriaPrimaMutation = (
  onSubmitSuccess: () => void,
  reset: () => void,
  isUpdate?: boolean,
  initialDataId?: number | undefined,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoteMateriaPrimaFormSumit) =>
      handleCreateUpdateLoteMateriaPrima(
        data,
        isUpdate ? initialDataId : undefined,
      ),
    onSuccess: async (_, { materia_prima }) => {
      reset();
      onSubmitSuccess();
      if (materia_prima) {
        await queryClient.invalidateQueries({
          queryKey:
            createMateriaPrimaListPKQueryOptions(materia_prima).queryKey,
        });
        await queryClient.invalidateQueries({
          queryKey: createLotesMateriaPrimaQueryOptions(materia_prima).queryKey,
        });
        await queryClient.invalidateQueries({
          queryKey: lotesMateriaPrimaQueryOptions(materia_prima).queryKey
        })
      };
      await queryClient.invalidateQueries({
        queryKey: createMateriaPrimaListQueryOptions().queryKey,
      });
    },
  });
};


export const useImportCSVMutationMateriaPrima = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: string) => uploadCSV(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: createMateriaPrimaListQueryOptions().queryKey,
      });
    },
  })
}