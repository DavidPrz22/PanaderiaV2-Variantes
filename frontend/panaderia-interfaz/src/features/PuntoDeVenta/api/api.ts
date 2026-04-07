import apiClient from "@/api/client";
import type { TAperturaCaja, TVenta } from "../schemas/schemas";
import axios from "axios";
import type { Producto, Categorias } from "../types/types";

type CheckIsActiveResponse = {
  is_active: boolean;
}

export const checkIsActive = async (): Promise<CheckIsActiveResponse> => {
  try {
    const response = await apiClient.get("/api/ventas/apertura-cierre-caja/is-active/");
    return response.data;
  } catch (error) {
    console.error("Error checking if caja is active:", error);
    throw error;
  }
};

export const aperturaCaja = async (data: TAperturaCaja): Promise<CheckIsActiveResponse> => {
  try {
    const response = await apiClient.post("/api/ventas/apertura-cierre-caja/", data);
    return response.data;
  } catch (error) {
    console.error("Error opening caja:", error);
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


export const getProductos = async (): Promise<{ productos: Producto[] }> => {
  try {
    const response = await apiClient.get("/api/inventario/caja-productos-lista/");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching productos:", error);
    throw error;
  }
};

export const getCategorias = async (): Promise<{ categorias: Categorias }> => {
  try {
    const response = await apiClient.get("/api/inventario/caja-categorias/");
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching categorias:", error);
    throw error;
  }
};


export const createVenta = async (data: TVenta): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post("/api/ventas/pos-venta/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating venta:", error);
    throw error;
  }
}

export type TCierreCaja = {
  monto_final_usd?: number;
  monto_final_ves?: number;
  notas_cierre?: string;
};

export const cerrarCaja = async (data: TCierreCaja): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post("/api/ventas/apertura-cierre-caja/cerrar/", data);
    return response.data;
  } catch (error) {
    console.error("Error closing caja:", error);
    throw error;
  }
};