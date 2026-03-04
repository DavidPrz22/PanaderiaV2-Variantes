import { z } from "zod";


export const productosIntermediosVariantesSchema = z.object({
  nombre_variante: z.string().min(3, "El nombre de la variante debe tener al menos 3 caracteres"),
  SKU: z.string().min(3, "El SKU debe tener al menos 3 caracteres"),
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
  atributo: z.string(),
})


export const productosIntermediosSchema = z.object({
  nombre_producto: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  categoria: z.coerce
    .number({
      required_error: "La categoría es requerida",
      invalid_type_error: "La categoría no es válida",
    })
    .min(1, "La categoría es requerida"),
  unidad_produccion: z.coerce
    .number({
      required_error: "La unidad de producción es requerida",
      invalid_type_error: "La unidad de producción no es válida",
    })
    .min(1, "La unidad de producción es requerida"),
  descripcion: z
    .string()
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .optional(),
  variantes: z.array(productosIntermediosVariantesSchema),
});


export type TProductosIntermediosSchema = z.infer<
  typeof productosIntermediosSchema
>;

export type TProductosIntermediosVariantesSchema = z.infer<
  typeof productosIntermediosVariantesSchema
>;
