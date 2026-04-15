import apiClient from "@/api/client";
import axios from "axios";
import type {
  ProveedorRegistro,
  OrdenCompra,
  EstadoOC,
  MetodoDePago,
  Producto,
  OrdenesCompraPagination,
} from "../types/types";
import type { UnidadesDeMedida } from "@/features/ProductosIntermedios/types/types";
import type {
  TEmailSchema,
  TOrdenCompraSchema,
  TPagoSchema,
  TRecepcionFormSchema,
} from "../schemas/schemas";

export type OrdenCompraDetallesResponse = {
  orden: OrdenCompra;
};

export const getProveedores = async (): Promise<ProveedorRegistro[]> => {
  try {
    const response = await apiClient.get(
      "/api/compras/proveedores/compra_registro/",
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching proveedores:", error);
    return [];
  }
};

export const getOrdenesComprasTable = async ({
  pageParam,
}: { pageParam?: string | null } = {}): Promise<OrdenesCompraPagination> => {
  const route = pageParam || "/api/compras/ordenes-compra-lista/";

  try {
    const response = await apiClient.get(route);
    return response.data;
  } catch (error) {
    console.error("Error fetching compras detalles:", error);
    throw error;
  }
};

export const getEstadosOrdenCompraRegistro = async (): Promise<EstadoOC[]> => {
  try {
    const response = await apiClient.get(
      "/api/estados-orden-compra/get-estados-registro/",
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching estados orden compra registro:", error);
    return [];
  }
};

export const getOrdenesComprasDetalles = async (
  id: number,
): Promise<OrdenCompraDetallesResponse> => {
  try {
    const response = await apiClient.get(
      `/api/compras/ordenes-compra/${id}/detalles/`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching compras detalles:", error);
    throw error;
  }
};

export const getMetodosDePago = async (): Promise<MetodoDePago[]> => {
  try {
    const response = await apiClient.get("/api/metodos-de-pago/");
    return response.data;
  } catch (error) {
    console.error("Error fetching metodos de pago:", error);
    return [];
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

export const getBCVRate = async (): Promise<BCVRateType> => {
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

export const getAllEstadosOrdenCompra = async (): Promise<EstadoOC[]> => {
  try {
    const response = await apiClient.get("/api/estados-orden-compra/");
    return response.data;
  } catch (error) {
    console.error("Error fetching estados orden compra:", error);
    return [];
  }
};

type ProductosOCSearchType = {
  productos: Producto[];
};
export const searchProductosOC = async (
  search: string,
): Promise<ProductosOCSearchType> => {
  try {
    const response = await apiClient.get(
      `/api/compras/productos-compras/?search=${search}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching productos:", error);
    throw error;
  }
};

export const getUnidadesMedida = async (): Promise<UnidadesDeMedida[]> => {
  try {
    const response = await apiClient.get("/api/unidades-medida/");
    return response.data;
  } catch (error) {
    console.error("Error fetching unidades de medida:", error);
    return [];
  }
};

export const createOrdenCompra = async (
  params: TOrdenCompraSchema,
): Promise<OrdenCompraDetallesResponse> => {
  try {
    const response = await apiClient.post(
      "/api/compras/ordenes-compra/",
      params,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating orden compra:", error);
    throw error;
  }
};

export const updateOrdenCompra = async (
  id: number,
  data: TOrdenCompraSchema,
): Promise<OrdenCompraDetallesResponse> => {
  try {
    const response = await apiClient.put(
      `/api/compras/ordenes-compra/${id}/`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating orden compra:", error);
    throw error;
  }
};

export const marcarEnviadaOC = async (
  id: number,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post(
      `/api/compras/ordenes-compra/${id}/marcar_enviada/`,
    );
    return response.data;
  } catch (error) {
    console.error("Error marking order as sent:", error);
    throw error;
  }
};

export const crearRecepcionOC = async (
  params: TRecepcionFormSchema,
): Promise<{ message: string; orden: OrdenCompra }> => {
  try {
    const response = await apiClient.post("/api/compras/compras/", params);
    return response.data;
  } catch (error) {
    console.error("Error creating reception:", error);
    throw error;
  }
};

export const registrarPago = async (
  params: TPagoSchema,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post(
      "/api/compras/pagos-proveedores/",
      params,
    );
    return response.data;
  } catch (error) {
    console.error("Error registering payment:", error);
    throw error;
  }
};

export const enviarEmailOC = async (
  id: number,
  params: TEmailSchema,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post(
      `/api/compras/ordenes-compra/${id}/enviar-email/`,
      params,
    );
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const deleteOrdenCompra = async (
  id: number,
): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/api/compras/ordenes-compra/${id}/`);
  return response.data;
};

