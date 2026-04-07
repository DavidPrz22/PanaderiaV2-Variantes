import type { UseFormWatch, UseFormSetValue } from "react-hook-form";


export type Carrito = {
    id: number;
    cliente_id: number;
    fecha: string;
    total: number;
    estado: string;
    items: CarritoItem[];
};

export type CarritoItem = {
    id: number;
    producto_id: number; // producto id
    variante_id?: number; // variante id if exists
    variante_nombre?: string; // name of the variant
    tipo: 'final' | 'reventa';
    nombre?: string;
    cantidad: number;
    precio: number;
    subtotal: number;
};

export type Producto = {
  id: number;
  nombre: string;
  unidadVenta: string;
  categoria: string;
  sku: string;
  tipo: "final" | "reventa";
  stock: number;
  variantes: ProductoVariante[];
}

export type ProductoVariante = {
  id: number;
  nombre: string;
  stock: number;
  precio: number;
  atributo: string;
  sku: string;
}

export type TipoProducto = "final" | "reventa" | 'todos';

export type Categorias = {
  [tipo in TipoProducto]: string[]
}

export type WatchSetValue = {
  watch?: UseFormWatch<any>;
  setValue?: UseFormSetValue<any>;
}