import apiClient from "@/api/client";
import type { TRecetaSchema } from "../schemas/schemas";
import type {
  RecetaRelacionada,
  RecetasPagination,
  ComponentesListaPorCategoria,
  productoElaboradoItem,
  RecetaDetalles,
} from "../types/types";

export const getComponentesRecetas = async (
  search: string,
): Promise<ComponentesListaPorCategoria> => {
  try {
    const response = await apiClient.get("/api/inventario/componentes-recetas/", {
      params: {
        search,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching componentes recetas:", error);
    throw error;
  }
};

export const getProductosElaborados = async (searchTerm: string): Promise<productoElaboradoItem[]> => {
  try {
    const response = await apiClient.get("/api/inventario/productos-elaborados/search/", {
      params: {
        search: searchTerm,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching productos elaborados:", error);
    throw error;
  }
}

export const registerUpdateReceta = async (data: TRecetaSchema, id?: number) => {
  try {
    if (id) {
      const response = await apiClient.put(`/api/produccion/recetas/${id}/update_receta/`, data);
      return response.data;
    }
    const response = await apiClient.post("/api/produccion/recetas/", data);
    return response.data;
  } catch (error) {
    console.error("Error registering/updating receta:", error);
    throw error;
  }
};

export const getRecetas = async ({
  pageParam
}: {
  pageParam?: string | null
} = {}): Promise<RecetasPagination> => {
  try { 
    const url = pageParam || "/api/produccion/recetas/";
    const response = await apiClient.get(url);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching recetas:", error);
    throw error;
  }
};

export const getRecetaDetalles = async (
  id: number,
): Promise<RecetaDetalles> => {
  try {
    const response = await apiClient.get(
      `/api/produccion/recetas/${id}/`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching receta detalles:", error);
    throw error;
  }
};

export const updateReceta = async (
  recetaId: number,
  data: TRecetaSchema,
) => {
  try {
    const response = await apiClient.put(
      `/api/recetas/${recetaId}/update_receta/`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating receta:", error);
    throw error;
  }
};

export const deleteReceta = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/produccion/recetas/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting receta:", error);
    throw error;
  }
};

export const getRecetasSearch = async (
  search: string,
  recetaId?: number,
): Promise<RecetaRelacionada[]> => {
  const searchOnReceta = true
  try {
    const response = await apiClient.get(
      `/api/produccion/recetas/search/`,
      { params: { search, recetaId, searchOnReceta } }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
