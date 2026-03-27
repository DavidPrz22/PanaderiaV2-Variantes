import { type Control, type FieldErrors } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { FormInput } from "@/components/shared";

import type { TRecetaSchema } from "@/features/Recetas/schemas/schemas";
import { useUnidadesMedidaQuery } from "@/hooks/useQueryHooks";
import { useRecetasContext } from "@/context/RecetasContext";

interface YieldSectionProps {
  control: Control<TRecetaSchema>;
  errors: FieldErrors<TRecetaSchema>;
}

export function YieldSection({ control, errors }: YieldSectionProps) {
  const { data: unidadesMedida } = useUnidadesMedidaQuery();
  const { selectedItemProducto } = useRecetasContext();
  const unitLabel = unidadesMedida?.find((u) => u.nombre_completo === selectedItemProducto?.unidad_produccion);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Rendimiento</h2>
        <p className="text-sm text-muted-foreground">Cantidad que produce esta receta</p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-4">
          <FormField
            control={control}
            name="rendimiento"
            render={({ field }) => (
              <FormInput
                type="number"
                step="0.01"
                label="Rendimiento"
                className="w-[50%]"
                placeholder="0"
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                value={field.value || ""}
                error={errors.rendimiento?.message}
              />
            )}
          />
          <div className="px-2 py-1 bg-gray-200 rounded-lg self-end">
            {unitLabel?.abreviatura}
          </div>

        </div>
      </div>
    </div>
  );
}
