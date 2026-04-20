export const MODO_COMPRA = {
  UNIDAD: "unidad",
  CONTENEDOR: "contenedor",
} as const;

export type ModoCompra = (typeof MODO_COMPRA)[keyof typeof MODO_COMPRA];


export const TIPO_MEDIDA = {
  PESO: "Peso",
  VOLUMEN: "Volumen",
  UNIDAD: "Unidad",
  LONGITUD: "Longitud",
  OTRO: "Otro",
} as const;

export type TipoMedida = (typeof TIPO_MEDIDA)[keyof typeof TIPO_MEDIDA];
