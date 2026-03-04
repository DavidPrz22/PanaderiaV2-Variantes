import type { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { FormInput, FormSelect } from "@/components/shared";
import type { TProductosIntermediosSchema, TProductosIntermediosVariantesSchema } from "../../schemas/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useAtributosProductoQuery } from "@/hooks/useQueryHooks";


interface VariantesSectionProps {
    control: Control<TProductosIntermediosSchema>;
    register: UseFormRegister<TProductosIntermediosSchema>;
    errors: FieldErrors<TProductosIntermediosSchema>;
}


export const VariantesSection = ({ control, register, errors }: VariantesSectionProps) => {

    const { data: atributos } = useAtributosProductoQuery();

    const atributosOptions = atributos?.atributos.map((atributo) => ({
        value: atributo,
        label: atributo,
    })) || [];

    const { fields, append, remove, } = useFieldArray({
        control,
        name: "variantes",
    });

    const createEmptyVariante = (): TProductosIntermediosVariantesSchema => ({
        nombre_variante: "",
        SKU: "",
        descripcion: "",
        punto_reorden: 0,
        atributo: "",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium">Variantes del Producto</h3>
                    <p className="text-sm text-muted-foreground">
                        Define las variantes o presentaciones del producto
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append(createEmptyVariante())}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <Card key={field.id}>
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
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    label="Nombre Variante"
                                    placeholder="Ej: 500g, Caja 12u"
                                    error={errors.variantes?.[index]?.nombre_variante?.message}
                                    {...register(`variantes.${index}.nombre_variante`)}
                                />
                                <FormInput
                                    label="SKU"
                                    placeholder="Código único"
                                    error={errors.variantes?.[index]?.SKU?.message}
                                    {...register(`variantes.${index}.SKU`)}
                                />
                                <FormInput
                                    label="Punto de Reorden"
                                    type="number"
                                    error={errors.variantes?.[index]?.punto_reorden?.message}
                                    {...register(`variantes.${index}.punto_reorden`)}
                                />
                                <Controller
                                    name={`variantes.${index}.atributo`}
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label="Atributo "
                                            placeholder="Seleccionar atributo"
                                            options={atributosOptions}
                                            triggerClassName="w-full"
                                            containerClassName="w-full"
                                            required
                                            error={errors.variantes?.[index]?.atributo?.message}
                                            value={field.value}
                                            onValueChange={(val) => field.onChange(val)}
                                            className="w-full"
                                        />
                                    )}
                                />
                            </div>
                            <div className="mt-4">
                                <FormInput
                                    label="Descripción"
                                    placeholder="Descripción de la variante"
                                    error={errors.variantes?.[index]?.descripcion?.message}
                                    {...register(`variantes.${index}.descripcion`)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
