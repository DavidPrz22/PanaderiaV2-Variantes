import apiClient from "@/api/client";
import type { AxiosError } from "axios";

interface ClientesResponse {
    id: number;
    nombre_cliente: string;
    apellido_cliente: string;
    telefono: string;
    email: string;
    rif_cedula: string;
    fecha_registro: string;
    notas: string;  
}

export const createCliente = async (data: { 
    nombre_cliente: string; 
    apellido_cliente: string;
    telefono: string;
    email: string;
    rif_cedula: string;
    fecha_registro: string;
    notas: string;
}): Promise<ClientesResponse> => {
    try {
        const response = await apiClient.post("/api/ventas/clientes/", data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string; errors?: string[] }>;
    const errorMessage = axiosError.response?.data?.detail || 
        axiosError.message || 'Error creando cliente';

    console.error("Error al crear cliente:", errorMessage);
    throw new Error(errorMessage);
    }
};

export const getClientes = async () => {
    try {
    const response = await apiClient.get<ClientesResponse[]>("/api/ventas/clientes/");
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string; errors?: string[] }>;
    const errorMessage = axiosError.response?.data?.detail || 
        axiosError.message || 'Error obteniendo clientes';

    console.error("Error al obtener clientes:", errorMessage);
    throw new Error(errorMessage);
    }
};

export const deleteCliente = async (id: number) => {
    try {
    await apiClient.delete(`/api/ventas/clientes/${id}/`);
    } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string; errors?: string[] }>;
    const errorMessage = axiosError.response?.data?.detail || 
        axiosError.message || 'Error eliminando cliente';

    console.error("Error al eliminar cliente:", errorMessage);
    throw new Error(errorMessage);
    }
};
export const updateCliente = async (id: number, data: { 
    nombre_cliente?: string; 
    apellido_cliente?: string;
    telefono?: string;
    email?: string;
    rif_cedula?: string;
    fecha_registro?: string;
    notas?: string;
}): Promise<ClientesResponse> => {
    try {
        const response = await apiClient.put(`/api/ventas/clientes/${id}/`, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string; errors?: string[] }>;
    const errorMessage = axiosError.response?.data?.detail || 
        axiosError.message || 'Error actualizando cliente';

    console.error("Error al actualizar cliente:", errorMessage);
    throw new Error(errorMessage);
    }
};

export const searchClientes = async (query: string): Promise<ClientesResponse[]> => {
    try {
        const response = await apiClient.get('/api/ventas/clientes/search/', {
            headers: { 'Content-Type': 'application/json' },
            params: { q: query }
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string; errors?: string[] }>;
    const errorMessage = axiosError.response?.data?.detail || 
        axiosError.message || 'Error buscando clientes';

    console.error("Error al buscar clientes:", errorMessage);
    throw new Error(errorMessage);
    }
};
export const filterClientes = async (filters: { 
    nombre_cliente?: string; 
    apellido_cliente?: string;
    telefono?: string;
    email?: string;
    rif_cedula?: string;
    fecha_registro?: string;
    notas?: string;
}): Promise<ClientesResponse[]> => {
    try {
        const response = await apiClient.get('/api/ventas/clientes/filter/', {
            headers: { 'Content-Type': 'application/json' },
            params: filters
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string; errors?: string[] }>;
    const errorMessage = axiosError.response?.data?.detail || 
        axiosError.message || 'Error filtrando clientes';

    console.error("Error al filtrar clientes:", errorMessage);
    throw new Error(errorMessage);
    }
};