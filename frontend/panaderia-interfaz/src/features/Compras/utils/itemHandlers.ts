import type { DetalleOC, Producto } from "../types/types";
import type { TOrdenCompraSchema } from "../schemas/schemas";
import type { UseFormWatch } from "react-hook-form";
import { MODO_COMPRA } from "./contants";

export const resetProductoItem = (item: DetalleOC) => {
  item.materia_prima = undefined;
  item.materia_prima_nombre = undefined;
  item.producto_reventa = undefined;
  item.producto_reventa_nombre = undefined;
};

export const updateItemFromProducto = (item: DetalleOC, producto: Producto) => {
  resetProductoItem(item);

  if (producto.tipo === "materia-prima") {
    item.materia_prima = producto.id;
    item.materia_prima_nombre = producto.nombre;
  } else {
    item.producto_reventa = producto.id;
    item.producto_reventa_nombre = producto.nombre;
  }

  item.costo_unitario_usd = producto.precio_compra_usd;
  item.unidad_medida_compra = producto.unidad_medida_compra.id;
  item.unidad_medida_abrev = producto.unidad_medida_compra.abreviatura;
  item.tipo_medida = producto.unidad_medida_compra.tipo_medida; // Store base unit tipo_medida for filtering
};

export const findProductoIndex = (
  watch: UseFormWatch<TOrdenCompraSchema>,
  productoId: number,
): number => {
  return watch("detalles")?.findIndex((p) => p.id === productoId) ?? -1;
};

export const createNewDetalleOC = (id: number): DetalleOC => ({
  id,
  materia_prima: undefined,
  materia_prima_nombre: undefined,
  producto_reventa: undefined,
  producto_reventa_nombre: undefined,
  cantidad_solicitada: 0,
  cantidad_recibida: 0,
  cantidad_pendiente: 0,
  unidad_medida_compra: 0,
  unidad_medida_abrev: undefined,
  tipo_medida: undefined,
  costo_unitario_usd: 0,
  subtotal_linea_usd: 0,
  modo_compra: MODO_COMPRA.UNIDAD,
});

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
