import apiClient from "../../../api/client";
import type { AxiosError } from "axios";
import {
  type LoteMateriaPrimaPagination,

} from "../types/types";

import type { TLoteMateriaPrimaSchema, TMateriaPrimaSchema } from "../schemas/schemas";

import { type TMateriaPrima, MateriaPrimaSchema, MateriaPrimaPaginationSchema, type TMateriaPrimaPagination } from "../schemas/zod-types";



// API CALL FOR MATERIA PRIMA to create materia prima
export const handleCreateUpdateMateriaPrima = async (
  data: TMateriaPrimaSchema,
  id?: number,
) => {
  const url = id ? `/api/inventario/materiaprima/${id}/` : "/api/inventario/materiaprima/";
  const method = id ? "put" : "post";
  try {
    const response = await apiClient[method](url, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    if (axiosError.response) {
      return {
        errorData: axiosError.response.data,
        status: axiosError.response.status,
        failed: true,
      };
    }
    throw error;
  }
};


// API CALL FOR MATERIA PRIMA LIST
export const handleMateriaPrimaList = async ({
  pageParam
}: {
  pageParam?: string | null
} = {}): Promise<TMateriaPrimaPagination> => {
  try {
    const url = pageParam || "/api/inventario/materiaprima/";
    const response = await apiClient.get(url);
    console.log(response.data)
    const valid = MateriaPrimaPaginationSchema.safeParse(response.data);
    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch materia prima list",
    );
  }
};


// API CALL FOR MATERIA PRIMA LIST PK
export const handleMateriaPrimaListPK = async (
  pk: number,
): Promise<TMateriaPrima> => {
  try {
    const response = await apiClient.get(`/api/inventario/materiaprima/${pk}/`);
    const valid = MateriaPrimaSchema.safeParse(response.data);
    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return {} as TMateriaPrima;
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch materia prima",
    );
  }
};


// API CALL FOR DELETE MATERIA PRIMA
export const handleDeleteMateriaPrima = async (pk: number) => {
  try {
    const response = await apiClient.delete(`/api/inventario/materiaprima/${pk}/`);

    if (response.status === 204) {
      return { success: true };
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to delete materia prima",
    );
  }
};


// API CALL FOR CREATE LOTE MATERIA PRIMA
export const handleCreateUpdateLoteMateriaPrima = async (
  data: TLoteMateriaPrimaSchema,
  id?: number,
): Promise<void> => {
  const isUpdate = id !== undefined;
  const url = isUpdate
    ? `/api/inventario/lotesmateriaprima/${id}/`
    : "/api/inventario/lotesmateriaprima/";
  const method = isUpdate ? "put" : "post";
  try {
    const formattedData = {
      ...data,
      fecha_recepcion: data.fecha_recepcion instanceof Date ? data.fecha_recepcion.toISOString().split('T')[0] : data.fecha_recepcion,
      fecha_caducidad: data.fecha_caducidad instanceof Date ? data.fecha_caducidad.toISOString().split('T')[0] : data.fecha_caducidad,
    }
    await apiClient[method](url, formattedData);
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to create/update lote",
    );
  }
};


// API CALL FOR DELETE LOTE MATERIA PRIMA
export const handleDeleteLoteMateriaPrima = async (pk: number | undefined) => {
  if (!pk) {
    return { success: false };
  }
  try {
    await apiClient.delete(`/api/inventario/lotesmateriaprima/${pk}/`);
    return { success: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to delete lote",
    );
  }
};

// API CALL FOR ACTIVATE LOTE MATERIA PRIMA
export const handleChangeLoteMateriaPrimaStatus = async (
  pk: number,
  action: 'ACTIVAR' | 'INACTIVAR',
) => {

  try {
    await apiClient.post(`/api/inventario/lotesmateriaprima/${pk}/update-status/`, { action });
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to change lote status",
    );
  }
};


export const uploadYAML = async (Base64File: string): Promise<{ status: number, message: string }> => {
  try {
    const response = await apiClient.post('/api/inventario/materiaprima/register-yaml/', { file: Base64File });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to upload YAML",
    );
  }
}

export const getLotesMateriaPrima = async ({
  pageParam,
  materia_prima_id,
}: {
  pageParam?: string | null;
  materia_prima_id?: number;
} = {}): Promise<LoteMateriaPrimaPagination> => {
  try {
    let url = pageParam || "/api/inventario/lotesmateriaprima/";
    if (!pageParam && materia_prima_id) {
      url += `?materia_prima=${materia_prima_id}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch lotes materia prima",
    );
  }
};