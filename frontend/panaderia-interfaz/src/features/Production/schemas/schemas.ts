import z from "zod";

const componenteSchema = z.object({
  componente_id: z
    .number()
    .min(0, { message: "El ID del componente debe ser un número positivo" }),
  cantidad: z.number().min(1, { message: "La cantidad debe ser al menos 1" }),
  tipo: z.enum(["MateriaPrima", "ProductoIntermedio"], {
    required_error: "El tipo de componente es requerido",
    invalid_type_error: "El tipo de componente debe ser 'MateriaPrima' o 'ProductoIntermedio'",
  }),
});

export const productionSchema = z.object({
  producto_variante_id: z
    .number()
    .min(0, { message: "El ID del producto debe ser un número positivo" }).nullable(),
  componentes: z
    .array(componenteSchema)
    .min(1, { message: "Debe haber al menos un componente" }),
  cantidadProduction: z
    .number()
    .min(1, { message: "La cantidad a producir debe ser al menos 1" }),
  tipoProducto: z.enum(["producto-final", "producto-intermedio"], {
    required_error: "El tipo de producto es requerido",
    invalid_type_error:
      "El tipo de producto debe ser 'producto-final' o 'producto-intermedio'",
  }),
  fechaExpiracion: z.string({
    required_error: "La fecha de expiración es requerida",
  }).refine((date) => {
    // Validate that the date is in YYYY-MM-DD format and not before today
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return selectedDate >= today;
  }, {
    message: "La fecha de expiración debe ser válida y no puede ser anterior a hoy",
  }),
  peso: z.number().optional(),
  volumen: z.number().optional(),
});

export type TProductionFormData = z.infer<typeof productionSchema>;
