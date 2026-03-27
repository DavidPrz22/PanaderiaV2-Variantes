import { type Control } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import type { TRecetaSchema } from "@/features/Recetas/schemas/schemas";
import { FormInput, FormTextarea } from "@/components/shared";
import type { FieldErrors } from "react-hook-form";

interface GeneralInfoSectionProps {
  control: Control<TRecetaSchema>;
  errors: FieldErrors<TRecetaSchema>;
}

export function GeneralInfoSection({ control, errors }: GeneralInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Información General</h2>
        <p className="text-sm text-muted-foreground">Datos básicos de la receta</p>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-5">
        <FormField
          control={control}
          name="nombre"
          render={({ field }) => (
              <FormInput label="Nombre" placeholder="Ej: Pan Francés Clásico" {...field} error={errors.nombre?.message} />
          )}
        />

        <FormField
          control={control}
          name="notas"
          render={({ field }) => (
            <FormTextarea label="Notas" placeholder="Instrucciones de preparación, observaciones, etc." {...field} error={errors.notas?.message} />
          )}
        />
      </div>
    </div>
  );
}
