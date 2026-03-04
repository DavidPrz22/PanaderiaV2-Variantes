import apiClient from "@/api/client";
import type { TProductosIntermediosSchema } from "../schemas/schema";
import type {
  ProductosIntermediosDetalles,
  LoteProductoIntermedioPagination,
  ProductosIntermediosPagination,
} from "../types/types";

export const createUpdateProductosIntermedios = async (
  data: TProductosIntermediosSchema,
  id?: number,
) => {
  try {
    if (id) {
      const response = await apiClient.put(`/api/inventario/productos-intermedios/${id}/`, data);
      return response.data;
    }
    const response = await apiClient.post("/api/inventario/productos-intermedios/", data);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getProductosIntermedios = async ({
  pageParam
}: {
  pageParam?: string | null
} = {}): Promise<ProductosIntermediosPagination> => {
  try {
    const url = pageParam || "/api/inventario/productos-intermedios/";
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getProductosIntermediosDetalles = async (
  id: number,
): Promise<ProductosIntermediosDetalles> => {
  try {
    const response = await apiClient.get(
      `/api/inventario/productos-intermedios/${id}/`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteProductoIntermedio = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/inventario/productos-intermedios/${id}/`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const removeRecetaRelacionada = async (id: number) => {
  try {
    const response = await apiClient.post(
      `/api/productoselaborados/${id}/clear-receta-relacionada/`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getLotesProductosIntermedios = async ({
  pageParam,
  producto_intermedio_id,
}: {
  pageParam?: string | null;
  producto_intermedio_id?: number;
} = {}): Promise<LoteProductoIntermedioPagination> => {
  try {
    let url = pageParam || "/api/inventario/lotes-productos-elaborados/";
    if (!pageParam && producto_intermedio_id) {
      url += `?producto_elaborado=${producto_intermedio_id}`;
    }
    const response = await apiClient.get(url);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const changeEstadoLoteProductosIntermedios = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/inventario/lotes-productos-elaborados/${id}/change-estado-lote/`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteLoteProductoElaborado = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/inventario/lotes-productos-elaborados/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting lote producto elaborado:", error);
    throw error;
  }
};