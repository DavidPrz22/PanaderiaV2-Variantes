export type Notification = {
  id: string;
  type: "stock" | "expiracion" | "orden" | "entrega";
  title: string;
  message: string;
  time: string;
  priority: "high" | "medium" | "low";
};

export type DashBoardData = {
  notificaciones: string;
};

export type TipoProducto =
  | "Materia Prima"
  | "Producto Reventa"
  | "Producto Intermedio"
  | "Producto Final"
  | "TODOS";
export type TipoNotificacion =
  | "Bajo stock"
  | "Sin stock"
  | "Expiración"
  | "Entrega cercana"
  | "TODOS";
export type Prioridad = "Alto" | "Crítico" | "Medio" | "Bajo";

export type Variante = {
  id: number;
  nombre: string;
  sku: string;
}

export type Notificacion = {
  id: number;
  tipo_notificacion: TipoNotificacion;
  tipo_producto: TipoProducto;
  leida: boolean;
  tiempo: string;
  descripcion: string;
  prioridad: Prioridad;
  variante: Variante;
};
