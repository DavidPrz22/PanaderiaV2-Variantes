import type { ModoCompra } from "../utils/contants";

export type Proveedor = {
  id: number;
  nombre_proveedor: string;
  nombre_comercial?: string;
  email_contacto?: string;
  telefono_contacto?: string;
};

export type EstadosOC =
  | "Borrador"
  | "Enviada"
  | "Recibida Parcial"
  | "Recibida Completa"
  | "Recibida Sin Pagar"
  | "Cancelada";

export type ProveedorRegistro = {
  id: number;
  nombre_proveedor: string;
};

export type EstadoOC = {
  id: number;
  nombre_estado: string;
};

export type MetodoDePago = {
  id: number;
  nombre_metodo: string;
  requiere_referencia: boolean;
};

export type UnidadMedida = {
  id: number;
  abreviatura: string;
  tipo_medida: string;
};

export type VarianteProducto = {
  id: number;
  nombre: string;
  SKU: string;
  precio_compra_divisa: number;
  unidad_compra: UnidadMedida;
};

export type Producto = {
  id: number;
  nombre: string;
  unidad_medida_base: UnidadMedida;
  variantes: VarianteProducto[];
  tipo: "MateriaPrima" | "ProductoReventa";
};


export type Empaquetado = {
  id: number;
  empaque_nombre: string;
  cantidad_por_contenedor: number;
  unidad_medida: UnidadMedida;
  cantiad_unidad_medida: number;
};

export type OrdenCompraTable = {
  id: number;
  proveedor: string;
  fecha_emision_oc: string;
  fecha_entrega_esperada: string;
  fecha_entrega_real?: string;
  estado_oc: string;
  metodo_pago: string;
  monto_total_oc_usd: number;
};

export type PagoProveedor = {
  id: number;
  proveedor: Proveedor;
  compra_asociada?: number;
  orden_compra_asociada?: number;
  fecha_pago: string;
  metodo_pago: MetodoDePago;
  monto_pago_usd: number;
  monto_pago_ves: number;
  referencia_pago?: string;
};

export type DetalleOC = {
  id: number;
  materia_prima?: number;
  materia_prima_nombre?: string;
  producto_reventa?: number;
  producto_reventa_nombre?: string;
  cantidad_solicitada: number;
  modo_compra: ModoCompra;
  empaquetado?: Empaquetado;
  unidad_medida_compra?: UnidadMedida;
  cantidad_recibida?: number;
  cantidad_pendiente: number;
  tipo_medida?: string; // Base unit tipo_medida for filtering compatible purchase units
  costo_unitario_usd: number;
  subtotal_linea_usd: number; 
};

export type OrdenCompra = {
  id: number;
  proveedor: Proveedor;
  usuario_creador: number;
  fecha_emision_oc: string;
  fecha_entrega_esperada: string;
  fecha_entrega_real?: string;
  estado_oc: EstadoOC;
  monto_total_oc_usd: number;
  monto_total_oc_ves: number;
  metodo_pago: { id: number; nombre_metodo: string };
  tasa_cambio_aplicada: number;
  direccion_envio?: string;
  notas?: string;
  detalles: DetalleOC[];
  email_enviado: boolean;
  fecha_email_enviado?: string;
  terminos_pago?: string;
  recepciones: RecepcionOC[];
  pagos_en_adelantado: {
    monto_pago_usd: number;
    monto_pago_ves: number;
  } | null;
  monto_pendiente_pago_usd?: number;
};

export type RecepcionOC = {
  id: number;
  orden_compra: OrdenCompra;
  fecha_recepcion: string;
  monto_pendiente_pago_usd: number;
  numero_factura_proveedor?: string;
  numero_remision?: string;
  notas?: string;
  pagado?: boolean;
};

export type LoteRecepcion = {
  id: number;
  cantidad: number;
  fecha_caducidad: string;
};

export type ComponentesUIRecepcion = {
  linea_oc: DetalleOC;
  lotes: LoteRecepcion[];
  cantidad_total_recibida: number;
  cantidad_en_inventario?: number;
  cantidad_pendiente?: number;
};

export type DetalleRecepcion = {
  detalle_oc_id: number;
  lotes: LoteRecepcion[];
};

export type RecepcionForm = {
  orden_compra_id: number;
  fecha_recepcion: string;
  detalles: DetalleRecepcion[];
};

export type OrdenesCompraPagination = {
  previous: string | null;
  next: string | null;
  results: OrdenCompraTable[];
  count: number;
};
