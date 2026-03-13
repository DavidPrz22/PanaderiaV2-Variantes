import apiClient from "@/api/client";
import type { TProductosReventaSchema, TLoteProductosReventaSchema } from "../schemas/schema";
import type {
  ProductosReventaDetalles,
  Proveedor,
  LoteProductoReventaPagination,
  ProductosReventaPagination,
} from "../types/types";



export const getProveedores = async (): Promise<Proveedor[]> => {
  try {
    const response = await apiClient.get("/api/compras/proveedores/");
    return response.data;
  } catch (error) {
    console.error("Error fetching proveedores:", error);
    return [];
  }
};

export const getProductosReventa = async ({
  pageParam
}: {
  pageParam?: string | null
} = {}): Promise<ProductosReventaPagination> => {
  try {
    const url = pageParam || "/api/inventario/productosreventa/";
    const response = await apiClient.get(url);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching productos reventa:", error);
    throw error;
  }
};

export const getProductosReventaDetalles = async (
  id: number,
): Promise<ProductosReventaDetalles | null> => {
  try {
    const response = await apiClient.get(`/api/inventario/productosreventa/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching producto reventa detalles:", error);
    return null;
  }
};

export const createUpdateProductosReventa = async (
  data: TProductosReventaSchema,
  id?: number | null
) => {
  try {
    let response;
    if (id) {
      response = await apiClient.put(`/api/inventario/productosreventa/${id}/`, data);
    } else {
      response = await apiClient.post("/api/inventario/productosreventa/", data);
    }
    return response.data;
  } catch (error) {
    console.error("Error creating producto reventa:", error);
    throw error;
  }
};

export const deleteProductosReventa = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/inventario/productosreventa/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting producto reventa:", error);
    throw error;
  }
};

export const getLotesProductosReventa = async ({
  pageParam,
  producto_reventa_id,
}: {
  pageParam?: string | null;
  producto_reventa_id?: number;
} = {}): Promise<LoteProductoReventaPagination> => {
  try {
    let url = pageParam || "/api/lotes-productos-reventa/";
    if (!pageParam && producto_reventa_id) {
      url += `?producto_reventa_variante__producto_reventa=${producto_reventa_id}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching lotes productos reventa:", error);
    throw error;
  }
};

export const createLoteProductosReventa = async (
  data: Omit<TLoteProductosReventaSchema, 'fecha_recepcion' | 'fecha_caducidad'> & {
    fecha_recepcion: string;
    fecha_caducidad: string;
    stock_actual_lote: number;
    detalle_oc: null;
  },
) => {
  try {
    const response = await apiClient.post("/api/lotes-productos-reventa/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating lote productos reventa:", error);
    throw error;
  }
};

export const updateLoteProductosReventa = async (
  id: number,
  data: Omit<TLoteProductosReventaSchema, 'fecha_recepcion' | 'fecha_caducidad'> & {
    fecha_recepcion: string;
    fecha_caducidad: string;
    stock_actual_lote: number;
    detalle_oc: null;
  },
) => {
  try {
    const response = await apiClient.put(`/api/lotes-productos-reventa/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating lote productos reventa:", error);
    throw error;
  }
};

export const deleteLoteProductosReventa = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/lotes-productos-reventa/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting lote productos reventa:", error);
    throw error;
  }
};

export const changeEstadoLoteProductosReventa = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/lotes-productos-reventa/${id}/change-estado-lote/`);
    return response.data;
  } catch (error) {
    console.error("Error changing estado lote productos reventa:", error);
    return null;
  }
};


export const uploadCSV = async (file: string) => {
  try {
    const response = await apiClient.post(`/api/productosreventa/register-csv/`, { file: file });
    return response.data;
  } catch (error) {
    console.error("Error uploading CSV:", error);
    throw error;
  }
}