import apiClient from "@/api/client";
import type {
  ProductoFinalDetalles,
  ProductosFinalesPagination,
} from "../types/types";

import type { TProductoFinalSchema } from "../schemas/schemas";
import type { LoteProductoFinalPagination } from "../types/types";

export const getProductosFinales = async ({
  pageParam
}: {
  pageParam?: string | null
} = {}): Promise<ProductosFinalesPagination> => {
  try {
    const url = pageParam || "/api/inventario/productosfinales/";
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching productos finales:", error);
    throw error;
  }
};

export const getProductoFinalDetalles = async (
  id: number,
): Promise<ProductoFinalDetalles> => {
  try {
    const response = await apiClient.get(
      `/api/inventario/productosfinales/${id}/`,
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching producto elaborado:", error);
    throw error;
  }
};

export const createUpdateProductoFinal = async (data: TProductoFinalSchema, id?: number) => {
  try {
    let response;
    if (id) {
      response = await apiClient.put(`/api/inventario/productosfinales/${id}/`, data);
    } else {
      response = await apiClient.post("/api/inventario/productosfinales/", data);
    }
    return response.data;
  } catch (error) {
    console.error("Error creating or updating producto final:", error);
    throw error;
  }
};

export const deleteProductoFinal = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/inventario/productosfinales/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting producto final:", error);
    throw error;
  }
};


export const removeRecetaRelacionada = async (id: number) => {
  try {
    const response = await apiClient.post(
      `/api/inventario/productoselaborados/${id}/clear-receta-relacionada/`,
    );
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


export const getLotesProductosFinales = async ({
  pageParam,
  producto_final_id,
}: {
  pageParam?: string | null;
  producto_final_id?: number;
} = {}): Promise<LoteProductoFinalPagination> => {
  try {
    let url = pageParam || "/api/inventario/lotes-productos-elaborados/";
    if (!pageParam && producto_final_id) {
      url += `?producto_elaborado=${producto_final_id}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const changeEstadoLoteProductosFinales = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/inventario/lotes-productos-elaborados/${id}/change-estado-lote/`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const uploadCSV = async (file: string) => {
  try {
    const response = await apiClient.post(`/api/inventario/productoselaborados/register-csv/`, { file: file });
    return response.data;
  } catch (error) {
    console.error("Error uploading CSV:", error);
    throw error;
  }
};