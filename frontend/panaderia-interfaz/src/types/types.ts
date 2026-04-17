export type LotesEstados = "DISPONIBLE" | "INACTIVO" | "EXPIRADO" | "AGOTADO";

export type PaginatorActions = "next" | "previous" | "base";

export type BCVRateType = {
  fuente: string;
  nombre: string;
  compra: number;
  venta: number;
  promedio: number;
  fechaActualizacion: string;
};