import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUpdateProductosReventa,
  deleteProductosReventa,
  createUpdateLoteProductosReventa,
  deleteLoteProductosReventa,
  changeEstadoLoteProductosReventa,
  uploadYAML
} from "../../api/api";
import type { TProductosReventaSchema, TLoteProductosReventaSchema } from "../../schemas/schema";
import {
  productosReventaDetallesQueryOptions,
  productosReventaQueryOptions,
  lotesProductosReventaQueryOptions,
} from "../queries/queryOptions";

import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { useToast } from "@/utils/use-toast";

export const useCreateUpdateProductosReventaMutation = () => {
  const queryClient = useQueryClient();
  const { productoReventaId } = useProductosReventaContext();
  const { toast } = useToast();

  
  return useMutation({
    mutationFn: (data: TProductosReventaSchema) => createUpdateProductosReventa(data, productoReventaId),
    onSuccess: () => {
      
      queryClient.invalidateQueries({
        queryKey: productosReventaQueryOptions.queryKey,
      });
      if (productoReventaId) {
        queryClient.invalidateQueries({
          queryKey: productosReventaDetallesQueryOptions(productoReventaId).queryKey,
        });
      }

      const message = productoReventaId ? "actualizado" : "creado";
      toast({
        title: `Producto reventa ${message}`,
        description: `El producto reventa ha sido ${message} exitosamente`,
      });
    },
    onError: (error) => {
      console.error("Error creating producto reventa:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Error al guardar el producto reventa",
      });
    },
  });
};

export const useDeleteProductosReventaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProductosReventa(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: productosReventaQueryOptions.queryKey,
      });
      queryClient.removeQueries({
        queryKey: productosReventaDetallesQueryOptions(id).queryKey,
      });
    },
    onError: (error) => {
      console.error("Error deleting producto reventa:", error);
    },
  });
};

export const useCreateUpdateLoteProductosReventaMutation = (
  productoReventaId: number | undefined
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  type TVariables = {
    data: Omit<TLoteProductosReventaSchema, "fecha_caducidad" | "fecha_recepcion"> & {
      fecha_caducidad: string | undefined;
      fecha_recepcion: string;
    };
    loteId: number | null | undefined;
  };

  return useMutation<any, Error, TVariables>({
    mutationFn: ({ data, loteId }) => {
      if (loteId) {
        return createUpdateLoteProductosReventa(data, loteId);
      } else {
        return createUpdateLoteProductosReventa(data);
      }
    },
    onSuccess: async () => {
      if (productoReventaId) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: lotesProductosReventaQueryOptions(productoReventaId).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: productosReventaDetallesQueryOptions(productoReventaId).queryKey,
          }),
        ])
      }
      await queryClient.invalidateQueries({
        queryKey: productosReventaQueryOptions.queryKey,
      });
      toast({
        title: "Lote creado",
        variant: "success",
        description: "El lote ha sido creado exitosamente",
      });
    },
    onError: (error) => {
      console.error("Error creating/updating lote productos reventa:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Error al guardar el lote",
      });
    },
  });
};

export const useDeleteLoteProductosReventaMutation = (
  productoReventaId: number | undefined,
  handleClose?: () => void,
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteLoteProductosReventa(id),
    onSuccess: async () => {
      if (productoReventaId) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: lotesProductosReventaQueryOptions(productoReventaId).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: productosReventaDetallesQueryOptions(productoReventaId).queryKey,
          }),
        ])
      }
      await queryClient.invalidateQueries({
        queryKey: productosReventaQueryOptions.queryKey,
      });
      toast({
        title: "Lote eliminado",
        description: "El lote ha sido eliminado exitosamente",
      });
      if (handleClose) handleClose();
    },
    onError: (error) => {
      console.error("Error deleting lote productos reventa:", error);
    },
  });
};

export const useChangeEstadoLoteProductosReventa = (productoReventaId: number | null | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => changeEstadoLoteProductosReventa(id),
    onSuccess: async () => {
      if (productoReventaId) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: lotesProductosReventaQueryOptions(productoReventaId).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: productosReventaDetallesQueryOptions(productoReventaId).queryKey,
          }),
        ])
      }
      await queryClient.invalidateQueries({
        queryKey: productosReventaQueryOptions.queryKey,
      });
      toast({
        title: "Lote actualizado",
        variant: "success",
        description: "El lote ha sido actualizado exitosamente",
      });
    },
    onError: (error) => {
      console.error("Error changing estado lote productos reventa:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Error al actualizar el lote",
      });
    },
  });
};


export const useUploadYAMLProductosReventaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: string) => uploadYAML(file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productosReventaQueryOptions.queryKey,
      });
    },
    onError: (error) => {
      console.error("Error uploading YAML:", error);
    },
  });
}