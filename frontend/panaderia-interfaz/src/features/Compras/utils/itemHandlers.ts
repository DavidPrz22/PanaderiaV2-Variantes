import type { DetalleOC, Producto, VarianteProducto } from "../types/types";
import type { TOrdenCompraSchema } from "../schemas/schemas";
import type { UseFormWatch } from "react-hook-form";
import { MODO_COMPRA } from "./contants";
import { RoundToTwo } from "@/utils/utils";

export const resetProductoItem = (item: DetalleOC) => {
  item.materia_prima = undefined;
  item.materia_prima_nombre = undefined;
  item.producto_reventa = undefined;
  item.producto_reventa_nombre = undefined;
};

export const handleProductSelection = (
  linea: DetalleOC,
  producto: Producto,
  variante: VarianteProducto
): DetalleOC => {
  
  const isMP = producto.tipo === "MateriaPrima";
  const isPR = producto.tipo === "ProductoReventa";

  const cantidad = linea.cantidad_solicitada || 1;
  const precio = variante.precio_compra_divisa;

  return {
    ...linea,
    materia_prima: isMP ? variante.id : undefined,
    materia_prima_nombre: isMP ? `${producto.nombre} - ${variante.nombre}` : undefined,
    producto_reventa: isPR ? variante.id : undefined,
    producto_reventa_nombre: isPR ? `${producto.nombre} - ${variante.nombre}` : undefined,
    unidad_medida_compra: variante.unidad_compra,
    costo_unitario_usd: precio,
    modo_compra: MODO_COMPRA.UNIDAD,
    cantidad_solicitada: cantidad,
    subtotal_linea_usd: RoundToTwo(precio * cantidad),
  };
};

export const updateItemField = <K extends keyof DetalleOC>(
  linea: DetalleOC,
  field: K,
  value: DetalleOC[K]
): DetalleOC => {
  const newLinea = { ...linea, [field]: value };
  
  if (field === "cantidad_solicitada" || field === "costo_unitario_usd") {
    newLinea.subtotal_linea_usd = (newLinea.cantidad_solicitada || 0) * (newLinea.costo_unitario_usd || 0);
  }
  
  return newLinea;
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
  unidad_medida_compra: undefined,
  tipo_medida: undefined,
  costo_unitario_usd: 0,
  costo_unitario_ves: 0,
  subtotal_linea_usd: 0,
  subtotal_linea_ves: 0,
  modo_compra: MODO_COMPRA.UNIDAD,
});

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
