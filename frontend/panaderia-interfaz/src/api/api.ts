import apiClient from "./client";
import { z } from "zod";
import {
  UnidadMedidaSchema,
  CategoriaMateriaPrimaSchema,
  AtributosProductosSchema,
  ProveedorSchema,
  CategoriaProductoIntermedioSchema,
  CategoriaProductoFinalSchema,
  CategoriaProductoReventaSchema,
  ClienteSchema,
  type TUnidadMedida,
  type TCategoriaMateriaPrima,
  type TProveedor,
  type TAtributosProductos,
  type TCategoriaProductoIntermedio,
  type TCategoriaProductoFinal,
  type TCategoriaProductoReventa,
  type TCliente,
} from "@/types/zod-types";

import type { AxiosError } from "axios";

// UNIDADES DE MEDIDA API CALL
export const fetchUnidadesMedida = async (): Promise<TUnidadMedida[]> => {
  try {
    const response = await apiClient.get("/api/core/unidades-medida/");
    console.log(response.data)
    const valid = z.array(UnidadMedidaSchema).safeParse(response.data);

    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return [];
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch unidades medida",
    );
  }
};

// CATEGORIAS DE MATERIA PRIMA API CALL
export const fetchCategoriasMateriaPrima = async (): Promise<
  TCategoriaMateriaPrima[]
> => {
  try {
    const response = await apiClient.get("/api/core/categorias-materiaprima/");
    const valid = z.array(CategoriaMateriaPrimaSchema).safeParse(response.data);

    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return [];
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch categorias",
    );
  }
};

// API CALL FOR PROVEEDORES
export const fetchProveedores = async (): Promise<TProveedor[]> => {
  try {
    const response = await apiClient.get("/api/compras/proveedores/");
    console.log(response.data)
    const valid = z.array(ProveedorSchema).safeParse(response.data);
    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return [];
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch proveedores",
    );
  }
};

export const fetchAtributosProducto = async (): Promise<TAtributosProductos> => {
  try {
    const response = await apiClient.get("/api/core/atributos-producto/");
    const valid = AtributosProductosSchema.safeParse(response.data);
    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    throw new Error("Invalid response from server");
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch atributos",
    );
  }
};

export const fetchCategoriasProductoIntermedio = async (): Promise<TCategoriaProductoIntermedio[]> => {
  try {
    const response = await apiClient.get("/api/core/categorias-producto-intermedio/");
    const valid = z.array(CategoriaProductoIntermedioSchema).safeParse(response.data);
    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return [];
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch categorias",
    );
  }
};

export const fetchProductosIntermediosCategorias = async (): Promise<TCategoriaProductoIntermedio[]> => {
  try {
    const response = await apiClient.get("/api/core/categorias-producto-intermedio/");
    const valid = z.array(CategoriaProductoIntermedioSchema).safeParse(response.data);
    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return [];
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch categorias",
    );
  }
};

export const fetchCategoriasProductoFinal = async (): Promise<TCategoriaProductoFinal[]> => {
  try {
    const response = await apiClient.get("/api/core/categorias-producto-final/");
    const valid = z.array(CategoriaProductoFinalSchema).safeParse(response.data);
    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return [];
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch categorias",
    );
  }
};

export const fetchCategoriasProductoReventa = async (): Promise<TCategoriaProductoReventa[]> => {
  try {
    const response = await apiClient.get("/api/core/categorias-productos-reventa/");
    const valid = z.array(CategoriaProductoReventaSchema).safeParse(response.data);
    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return [];
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch categorias",
    );
  }
};

export const fetchClientes = async (): Promise<TCliente[]> => {
  try {
    const response = await apiClient.get("/api/ventas/clientes/");
    console.log(response.data)
    const valid = z.array(ClienteSchema).safeParse(response.data);
    if (valid.success) {
      return valid.data;
    }
    console.log(valid.error)
    return [];
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(
      axiosError.response?.data?.detail || "Failed to fetch clientes",
    );
  }
};

