import type { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared";
import type { TProductosReventaSchema } from "../../schemas/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useAtributosProductoQuery } from "@/hooks/useQueryHooks";

interface VariantesSectionProps {
  control: Control<TProductosReventaSchema>;
  register: UseFormRegister<TProductosReventaSchema>;
  errors: FieldErrors<TProductosReventaSchema>;
}

export const VariantesSection = ({ control, register, errors }: VariantesSectionProps) => {
  const { data: atributos } = useAtributosProductoQuery();

  const atributosOptions = atributos?.atributos.map((atributo) => ({
    value: atributo,
    label: atributo,
  })) || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantes",
  });

  const createEmptyVariante = () => ({
    nombre_variante: "",
    SKU: "",
    descripcion: "",
    precio_venta_usd: 0,
    precio_venta_local: 0,
    punto_reorden: 0,
    precio_compra_divisa: 0,
    precio_compra_local: 0,
    atributo: "",
  });

  return (
    <div className="space-y-4 p-5 bg-white border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Variantes del Producto</h3>
          <p className="text-sm text-gray-500">
            Define las variantes o presentaciones del producto
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(createEmptyVariante() as any)}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="border-gray-200">
            <CardContent className="pt-6 relative">
              {fields.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-destructive hover:text-destructive/90"
                  onClick={() => remove(index)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Nombre Variante"
                  placeholder="Ej: 500g, Pack 6u"
                  required
                  error={errors.variantes?.[index]?.nombre_variante?.message}
                  {...register(`variantes.${index}.nombre_variante`)}
                />
                <FormInput
                  label="SKU"
                  placeholder="Código único"
                  required
                  error={errors.variantes?.[index]?.SKU?.message}
                  {...register(`variantes.${index}.SKU`)}
                />
                <FormInput
                  label="Precio Venta (USD)"
                  type="number"
                  step="0.01"
                  required
                  error={errors.variantes?.[index]?.precio_venta_divisa?.message}
                  {...register(`variantes.${index}.precio_venta_divisa`)}
                />
                <FormInput
                  label="Precio Venta (Local)"
                  type="number"
                  step="0.01"
                  required
                  error={errors.variantes?.[index]?.precio_venta_local?.message}
                  {...register(`variantes.${index}.precio_venta_local`)}
                />
                <FormInput
                  label="Precio Compra (USD)"
                  type="number"
                  step="0.01"
                  required
                  error={errors.variantes?.[index]?.costo_divisa?.message}
                  {...register(`variantes.${index}.costo_divisa`)}
                />
                <FormInput
                  label="Precio Compra (Local)"
                  type="number"
                  step="0.01"
                  required
                  error={errors.variantes?.[index]?.costo_local?.message}
                  {...register(`variantes.${index}.costo_local`)}
                />
                <FormInput
                  label="Punto de Reorden"
                  type="number"
                  required
                  error={errors.variantes?.[index]?.punto_reorden?.message}
                  {...register(`variantes.${index}.punto_reorden`)}
                />
                
                <Controller
                  name={`variantes.${index}.atributo`}
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Atributo"
                      placeholder="Seleccionar atributo"
                      options={atributosOptions}
                      triggerClassName="w-full"
                      containerClassName="w-full"
                      required
                      error={errors.variantes?.[index]?.atributo?.message}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                    />
                  )}
                />
              </div>
              <div className="mt-4">
                <FormTextarea
                  label="Descripción"
                  placeholder="Descripción de la variante"
                  error={errors.variantes?.[index]?.descripcion?.message}
                  rows={2}
                  {...register(`variantes.${index}.descripcion`)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {errors.variantes?.message && (
          <p className="text-sm text-destructive">{errors.variantes.message}</p>
        )}
      </div>
    </div>
  );
};
