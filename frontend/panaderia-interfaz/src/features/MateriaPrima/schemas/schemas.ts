import { z } from "zod";


const varianteSchema = z.object({
  nombre_variante: z.string().min(6, "El nombre debe tener al menos 6 caracteres"),
  SKU_variante: z.string().optional().nullable().refine((value) => value === null || value === undefined || value.length >= 6, "El SKU debe tener al menos 6 caracteres"),
  unidad_compra: z.coerce
    .number({
      required_error: "La unidad de compra es requerida",
      invalid_type_error: "La unidad de compra no es válida",
    })
    .min(1, "La unidad de compra es requerida"),
  precio_compra_divisa: z.coerce.number().min(0, "El precio de compra debe ser mayor a 0").optional().nullable(),
  precio_compra_local: z.coerce.number().min(0, "El precio de compra debe ser mayor a 0").optional().nullable(),
  nombre_empaque_estandar: z.string().optional().nullable(),
  cantidad_empaque_estandar: z.coerce.number().optional().nullable(),
  unidad_medida_empaque_estandar: z.coerce
    .number({
      required_error: "La unidad de medida es requerida",
      invalid_type_error: "La unidad de medida no es válida",
    })
    .optional()
    .nullable(),
})

export const materiaPrimaSchema = z.object({
  nombre: z.string().min(6, "El nombre debe tener al menos 6 caracteres"),
  SKU: z.string().min(6, "El SKU debe tener al menos 6 caracteres"),
  punto_reorden: z.coerce
    .number()
    .positive()
    .min(1, "El punto de reorden debe ser mayor a 0"),
  unidad_medida_base: z.coerce
    .number({
      required_error: "La unidad de medida es requerida",
      invalid_type_error: "La unidad de medida no es válida",
    })
    .min(1, "La unidad de medida es requerida"),
  categoria: z.coerce
    .number({
      required_error: "La categoría es requerida",
      invalid_type_error: "La categoría no es válida",
    })
    .min(1, "La categoría es requerida"),
  descripcion: z
    .string()
    .min(0, "La descripción debe tener al menos 5 caracteres")
    .optional()
    .nullable(),
  variantes: z.array(varianteSchema).min(1, "Al menos una variante es requerida"),
});



export const loteMateriaPrimaSchema = z
  .object({
    proveedor_id: z.coerce
      .number({
        required_error: "El proveedor es requerido",
        invalid_type_error: "El proveedor no es válido",
      })
      .min(1, "El proveedor es requerido"),
    fecha_recepcion: z.coerce.date({
      required_error: "La fecha de recepción es requerida",
      invalid_type_error: "La fecha de recepción no es válida",
    }),
    fecha_caducidad: z.coerce.date({
      required_error: "La fecha de caducidad es requerida",
      invalid_type_error: "La fecha de caducidad no es válida",
    }),
    cantidad_recibida: z.coerce
      .number({
        required_error: "La cantidad recibida es requerida",
        invalid_type_error: "La cantidad recibida no es válida",
      })
      .min(1, "La cantidad recibida debe ser mayor a 0"),
    costo_unitario_local: z.coerce
      .number()
      .min(0, "El costo unitario debe ser mayor a 0"),
    costo_unitario_divisa: z.coerce
      .number()
      .min(0, "El costo unitario debe ser mayor a 0"),
  })
  .refine((data) => data.fecha_recepcion < data.fecha_caducidad, {
    message: "La fecha de recepción debe ser anterior a la fecha de caducidad",
    path: ["fecha_recepcion"],
  });

export type TLoteMateriaPrimaSchema = z.infer<typeof loteMateriaPrimaSchema>;
export type TMateriaPrimaSchema = z.infer<typeof materiaPrimaSchema>;
