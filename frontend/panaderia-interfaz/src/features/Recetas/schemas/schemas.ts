import { z } from "zod";


const componentesRecetasSchema = z.object({
  componente_id: z.coerce
    .number()
    .min(1, { message: "El componente debe ser valido" }),
  tipo: z.enum(["MateriaPrima", "ProductoIntermedio"]),
  cantidad: z.coerce
    .number()
    .min(1, { message: "La cantidad debe ser mayor que 0" }),
});

const recetaRelacionadaSchema = z.object({
  receta_id: z.coerce
    .number()
    .min(0, { message: "La receta relacionada debe ser valida" }),
});

export const recetaSchema = z.object({
  nombre: z
    .string({
      required_error: "El nombre es requerido",
      invalid_type_error: "El nombre no es válido",
    })
    .min(3, "El nombre debe tener al menos 3 caracteres"),

  rendimiento: z.coerce
    .number()
    .positive({ message: "El rendimiento debe ser mayor que 0" })
    .optional()
    .or(z.literal(null))
    .or(z.literal("")),
  componentes: z.array(componentesRecetasSchema).min(1, {
    message: "El componente es requerido",
  }),
  producto_elaborado_variante: z.coerce
    .number()
    .min(1, { message: "El producto elaborado variante debe ser valido" })
    .optional()
    .or(z.literal(null))
    .or(z.literal("")),
  notas: z
    .string()
    .refine((val) => !val || val.length >= 3, {
      message: "Las notas no pueden tener menos de 3 caracteres",
    })
    .refine((val) => !val || val.length <= 250, {
      message: "Las notas no pueden tener más de 250 caracteres",
    })
    .optional(),
  recetas_relacionadas: z.array(recetaRelacionadaSchema).optional(),
});

export type TcomponentesRecetasSchema = z.infer<typeof componentesRecetasSchema>;
export type TrecetaRelacionadaSchema = z.infer<typeof recetaRelacionadaSchema>;
export type TRecetaSchema = z.infer<typeof recetaSchema>;
