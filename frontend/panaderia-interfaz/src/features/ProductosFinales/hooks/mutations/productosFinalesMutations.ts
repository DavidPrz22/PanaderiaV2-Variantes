import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteProductoFinal,
  createUpdateProductoFinal,
  removeRecetaRelacionada,
  changeEstadoLoteProductosFinales,
  deleteLoteProductoElaborado,
  uploadYAML,
} from "../../api/api";
import type { TProductoFinalSchema } from "../../schemas/schemas";

import {
  productosFinalesQueryOptions,
  productoFinalDetallesQueryOptions,
  lotesProductosFinalesQueryOptions,
} from "../queries/productosFinalesQueryOptions";

import { finalesSearchOptions } from "@/features/Production/hooks/queries/ProductionQueryOptions";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";

import { useToast } from "@/utils/use-toast";

export const useCreateUpdateProductoFinalMutation = () => {

  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ data, id }: { data: TProductoFinalSchema; id?: number }) =>
      createUpdateProductoFinal(data, id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: productosFinalesQueryOptions.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: finalesSearchOptions.queryKey,
      });
      if (id) {
        queryClient.invalidateQueries({
          queryKey: productoFinalDetallesQueryOptions(id).queryKey,
        });
      }

      toast({
        title: "Producto final guardado",
        description: "El producto final ha sido guardado correctamente",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un error al actualizar el producto final",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteProductoFinal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteProductoFinal(id),
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: productosFinalesQueryOptions.queryKey,
      });
      queryClient.removeQueries({
        queryKey: productoFinalDetallesQueryOptions(id).queryKey,
      });

      toast({
        title: "Producto final eliminado",
        description: "El producto final ha sido eliminado correctamente",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un error al eliminar el producto final",
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
      queryClient.invalidateQueries({
        queryKey: productoFinalDetallesQueryOptions(id).queryKey,
      });

      toast({
        title: "Receta eliminada",
        description: "La receta ha sido eliminada correctamente",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un error al eliminar la receta",
        variant: "destructive",
      });
    },
  });
};

export const useChangeEstadoLoteProductosFinales = () => {

  const queryClient = useQueryClient();
  const { productoId } = useProductosFinalesContext();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => changeEstadoLoteProductosFinales(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: lotesProductosFinalesQueryOptions(productoId!).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: productosFinalesQueryOptions.queryKey,
        }),
      ]);

      toast({
        title: "Estado del lote actualizado",
        description: "El estado del lote ha sido actualizado correctamente",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un error al actualizar el estado del lote",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteLoteProductoElaboradoMutation = () => {
  
  const { productoId } = useProductosFinalesContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await deleteLoteProductoElaborado(id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: lotesProductosFinalesQueryOptions(productoId!).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: productoFinalDetallesQueryOptions(productoId!).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: productosFinalesQueryOptions.queryKey,
        }),
      ]);

      toast({
        title: "Lote eliminado",
        description: "El lote ha sido eliminado correctamente",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un error al eliminar el lote",
        variant: "destructive",
      });
    },
  });
};

export const useUploadYAMLProductosFinalesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: string) => uploadYAML(file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productosFinalesQueryOptions.queryKey,
      });
    },
    onError: (error) => {
      console.error("Error uploading YAML:", error);
    },
  });
};