import apiClient from "@/api/client";
import type {
  Cliente,
  EstadoOrden,
  MetodoPago,
  OrdenProductosSearch,
  OrdenesPagination,
  Orden,
  CancelOrdenResponse,
} from "../types/types";
import axios from "axios";
import type { TOrderSchema } from "../schema/schema";

export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await apiClient.get("/api/ventas/clientes/");
    return response.data;
  } catch (error) {
    console.error("Error fetching clientes:", error);
    throw error;
  }
};

export const getMetodosDePago = async (): Promise<MetodoPago[]> => {
  try {
    const response = await apiClient.get("/api/core/metodos-de-pago/");
    return response.data;
  } catch (error) {
    console.error("Error fetching metodos de pago:", error);
    throw error;
  }
};

export const getAllEstadosOrdenVenta = async (): Promise<EstadoOrden[]> => {
  try {
    const response = await apiClient.get("/api/core/estados-orden-venta/");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching estados de orden:", error);
    throw error;
  }
};

export const getEstadosOrdenRegistro = async (): Promise<EstadoOrden[]> => {
  try {
    const response = await apiClient.get(
      "/api/core/estados-orden-venta/get-estados-registro/",
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching estados de orden:", error);
    throw error;
  }
};

export const getOrdenProductosSearch = async (
  search: string,
): Promise<OrdenProductosSearch> => {
  try {
    const response = await apiClient.get("/api/inventario/productos-pedidos-search/", {
      params: {
        search,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching orden productos search:", error);
    throw error;
  }
};

export type BCVRateType = {
  fuente: string;
  nombre: string;
  compra: number;
  venta: number;
  promedio: number;
  fechaActualizacion: string;
};

export const BCVRate = async (): Promise<BCVRateType> => {
  try {
    const response = await axios.get(
      `https://ve.dolarapi.com/v1/dolares/oficial`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching BCV rate:", error);
    throw error;
  }
};

export const createOrden = async (data: TOrderSchema) => {
  try {
    const response = await apiClient.post("/api/ventas/ordenes/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating orden:", error);
    throw error;
  }
};

export const updateOrden = async (id: number, data: TOrderSchema) => {
  try {
    const response = await apiClient.put(`/api/ventas/ordenes/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating orden:", error);
    throw error;
  }
};

export const getOrdenes = async ({
  pageParam,
}: {
  pageParam?: string | null;
} = {}): Promise<OrdenesPagination> => {
  try {
    const url = pageParam || "/api/ventas/ordenes-lista/";
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching ordenes:", error);
    throw error;
  }
};

export const cancelOrden = async (id: number): Promise<CancelOrdenResponse> => {
  try {
    const response = await apiClient.put(`/api/ventas/ordenes/${id}/cancel/`);
    return response.data;
  } catch (error) {
    console.error("Error canceling orden:", error);
    throw error;
  }
};
export const getOrdenesDetalles = async (id: number): Promise<Orden> => {
  try {
    const response = await apiClient.get(
      `/api/ventas/ordenes/${id}/get_orden_detalles/`,
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching ordenes detalles:", error);
    throw error;
  }
};

export const updateOrdenStatus = async (id: number, estado: string) => {
  try {
    const response = await apiClient.put(
      `/api/ventas/ordenes/${id}/update_status/?estado=${estado}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating orden status:", error);
    throw error;
  }
};

export const registerPaymentReference = async (
  id: number,
  referencia_pago: string,
) => {
  try {
    const response = await apiClient.put(
      `/api/ventas/ordenes/${id}/register_payment_reference/`,
      { referencia_pago },
    );
    return response.data;
  } catch (error) {
    console.error("Error registering payment reference:", error);
    throw error;
  }
};

export const deleteOrden = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/api/ventas/ordenes/${id}/`);
  return response.data;
};
