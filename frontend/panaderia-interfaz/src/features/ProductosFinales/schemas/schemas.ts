import { z } from "zod";

export const productosFinalesVariantesSchema = z.object({
  id: z.number().optional(),
  nombre_variante: z.string().min(3, "El nombre de la variante debe tener al menos 3 caracteres"),
  SKU: z.string().min(3, "El SKU debe tener al menos 3 caracteres"),
  precio_venta_divisa: z.coerce.number().min(0, "El precio de venta debe ser mayor o igual a 0"),
  precio_venta_local: z.coerce.number().min(0, "El precio de venta debe ser mayor o igual a 0"),
  punto_reorden: z.coerce
    .number()
    .positive()
    .min(0, "El punto de reorden debe ser mayor que 0"),
  descripcion: z
    .string()
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .refine((value) => value === "" || value.length >= 3, {
      message: "La descripción debe tener al menos 3 caracteres",
    })
    .optional(),
  atributo: z.string().min(1, "El atributo es requerido"),
});

export const productoFinalSchema = z.object({
  nombre_producto: z.string().min(1, "El nombre del producto es requerido"),
  descripcion: z
    .string()
    .refine((val) => !val || val.length >= 3, {
      message: "Las notas no pueden tener menos de 3 caracteres",
    })
    .refine((val) => !val || val.length <= 250, {
      message: "Las notas no pueden tener más de 250 caracteres",
    })
    .optional(),
  tipo_medida_fisica: z.enum(["UNIDAD", "PESO", "VOLUMEN"]),
  categoria: z.coerce.number().min(1, "La categoría es requerida"),
  unidad_venta: z.coerce.number().min(1, "La unidad de venta es requerida"),
  unidad_produccion: z.coerce
    .number()
    .min(1, "La unidad de producción es requerida"),
  vendible_por_medida_real: z.boolean(),
  usado_en_transformaciones: z.boolean(),
  variantes: z.array(productosFinalesVariantesSchema).min(1, "Se requiere al menos una variante"),
});

export type TProductoFinalSchema = z.infer<typeof productoFinalSchema>;
export type TProductosFinalesVariantesSchema = z.infer<typeof productosFinalesVariantesSchema>;

