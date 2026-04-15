export const MODO_COMPRA = {
  UNIDAD: "unidad",
  CONTENEDOR: "contenedor",
} as const;

export type ModoCompra = (typeof MODO_COMPRA)[keyof typeof MODO_COMPRA];