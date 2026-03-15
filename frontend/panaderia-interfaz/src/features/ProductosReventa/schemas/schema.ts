import { z } from "zod";

export const productosReventaVariantesSchema = z.object({
  id: z.number().optional(),
  nombre_variante: z.string().min(1, "El nombre de la variante es requerido"),
  descripcion: z.string().max(255, "La descripción no puede exceder 255 caracteres").optional(),
  SKU: z.string().min(1, "El SKU es requerido").max(50, "El SKU no puede exceder 50 caracteres"),
  atributo: z.string().min(1, "El atributo es requerido"),
  precio_venta_divisa: z.coerce.number().min(0, "El precio de venta debe ser mayor o igual a 0"),
  precio_venta_local: z.coerce.number().min(0, "El precio de venta local debe ser mayor o igual a 0").optional(),
  punto_reorden: z.coerce.number().min(0, "El punto de reorden debe ser mayor o igual a 0"),
  costo_divisa: z.coerce.number().min(0).optional(),
  costo_local: z.coerce.number().min(0).optional(),
});

export const productosReventaSchema = z.object({
  nombre_producto: z
    .string()
    .min(1, "El nombre del producto es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(255, "La descripción no puede exceder 255 caracteres")
    .optional(),
  categoria: z.coerce
    .number({
      required_error: "La categoría es requerida",
      invalid_type_error: "La categoría no es válida",
    })
    .min(1, "La categoría es requerida"),
  marca: z
    .string()
    .max(100, "La marca no puede exceder 100 caracteres")
    .optional(),
  proveedor_preferido: z.coerce.number().optional().nullable(),
  unidad_base_inventario: z.coerce
    .number({
      required_error: "La unidad base de inventario es requerida",
      invalid_type_error: "La unidad base de inventario no es válida",
    })
    .min(1, "La unidad base de inventario es requerida"),
  unidad_venta: z.coerce
    .number({
      required_error: "La unidad de venta es requerida",
      invalid_type_error: "La unidad de venta no es válida",
    })
    .min(1, "La unidad de venta es requerida"),
  factor_conversion: z.coerce
    .number()
    .min(0, "El Factor de conversion debe ser mayor o igual a 0"),
  es_pecedero: z.coerce.boolean(),
  variantes: z.array(productosReventaVariantesSchema).min(1, "Se requiere al menos una variante"),
});

export const loteProductosReventaSchema = z.object({
  producto_reventa_variante: z.coerce.number().min(1, "La variante es requerida"),
  cantidad_recibida: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
  coste_unitario_lote_divisa: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0"),
  coste_unitario_lote_local: z.coerce.number().min(0, "El costo local debe ser mayor o igual a 0").optional(),
  proveedor_id: z.coerce.number().min(1, "El proveedor es requerido"),
  fecha_recepcion: z.coerce.date({
    required_error: "La fecha de recepción es requerida",
    invalid_type_error: "La fecha de recepción no es válida",
  }),
  fecha_caducidad: z.coerce.date({
    required_error: "La fecha de caducidad es requerida",
    invalid_type_error: "La fecha de caducidad no es válida",
  }).optional(),
}).superRefine((data, ctx) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (data.fecha_caducidad) {
    if (data.fecha_caducidad < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de caducidad debe ser hoy o una fecha posterior",
        path: ["fecha_caducidad"],
      });
    }

    if (data.fecha_recepcion && data.fecha_caducidad <= data.fecha_recepcion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de caducidad debe ser posterior a la fecha de recepción",
        path: ["fecha_caducidad"],
      });
    }
  }
});

export type TProductosReventaSchema = z.infer<typeof productosReventaSchema>;
export type TLoteProductosReventaSchema = z.infer<typeof loteProductosReventaSchema>;
