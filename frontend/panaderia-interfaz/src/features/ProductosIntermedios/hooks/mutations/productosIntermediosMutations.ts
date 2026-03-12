import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUpdateProductosIntermedios,
  removeRecetaRelacionada,
  deleteProductoIntermedio,
  changeEstadoLoteProductosIntermedios,
  deleteLoteProductoElaborado,
} from "../../api/api";
import { getRecetasSearch } from "@/features/Recetas/api/api";
import type { TProductosIntermediosSchema } from "../../schemas/schema";
import {
  productosIntermediosDetallesQueryOptions,
  productosIntermediosQueryOptions,
  lotesProductosIntermediosQueryOptions,
} from "../queries/queryOptions";

import { intermediosSearchOptions } from "@/features/Production/hooks/queries/ProductionQueryOptions";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { useToast } from "@/utils/use-toast";

export const useGetRecetasSearchMutation = () => {
  return useMutation({
    mutationFn: (search: string) => getRecetasSearch(search),
  });
};

export const useCreateUpdateProductosIntermediosMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ data, id }: { data: TProductosIntermediosSchema, id?: number }) =>
      createUpdateProductosIntermedios(data, id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productosIntermediosQueryOptions.queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: intermediosSearchOptions.queryKey,
        }),
      ]);
      // toast({
      //   title: "Éxito",
      //   variant: 'success',
      //   description: "Producto intermedio guardado correctamente",
      // });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el producto intermedio",
        variant: "destructive",
      });
    },
  });
};

export const useRemoveRecetaRelacionadaMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => removeRecetaRelacionada(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({
        queryKey: productosIntermediosDetallesQueryOptions(id).queryKey,
      });
      toast({
        title: "Éxito",
        description: "Receta relacionada eliminada",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useChangeEstadoLoteProductosIntermedios = () => {
  const queryClient = useQueryClient();
  const { productoIntermedioId } = useProductosIntermediosContext();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => changeEstadoLoteProductosIntermedios(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: lotesProductosIntermediosQueryOptions(productoIntermedioId!).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: productosIntermediosQueryOptions.queryKey,
        }),
      ]);
      toast({
        title: "Éxito",
        description: "Estado del lote actualizado",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteProductoIntermedioMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => deleteProductoIntermedio(id),
    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productosIntermediosQueryOptions.queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: intermediosSearchOptions.queryKey,
        }),
      ]);
      queryClient.removeQueries({
        queryKey: productosIntermediosDetallesQueryOptions(id).queryKey,
      });
      toast({
        title: "Éxito",
        description: "Producto intermedio eliminado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProductosIntermediosMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: TProductosIntermediosSchema;
    }) => createUpdateProductosIntermedios(data, id),
    onSuccess: async (_, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productosIntermediosQueryOptions.queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: productosIntermediosDetallesQueryOptions(id).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: intermediosSearchOptions.queryKey,
        }),
      ]);
      toast({
        title: "Éxito",
        description: "Producto intermedio actualizado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteLoteProductoIntermedioMutation = (
  productoIntermedioId: number | undefined,
  handleClose: () => void,
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await deleteLoteProductoElaborado(id);
    },
    onSuccess: async () => {
      if (productoIntermedioId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: lotesProductosIntermediosQueryOptions(productoIntermedioId).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: productosIntermediosDetallesQueryOptions(productoIntermedioId).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: productosIntermediosQueryOptions.queryKey,
          }),
        ]);
        handleClose();
        toast({
          title: "Éxito",
          description: "Lote eliminado correctamente",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
