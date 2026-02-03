import { Trash2 } from "lucide-react";
import { type UseFormRegister, type Control, useWatch, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect } from "@/components/shared";
import type { TMateriaPrimaSchema } from "../schemas/schemas";
import type { TUnidadMedida } from "@/types/zod-types";

interface MateriaPrimaVarianteItemProps {
    index: number;
    register: UseFormRegister<TMateriaPrimaSchema>;
    control: Control<TMateriaPrimaSchema>;
    onRemove: (index: number) => void;
    canRemove: boolean;
    unidadesMedida: TUnidadMedida[];
    setValue: UseFormSetValue<TMateriaPrimaSchema>;
    errors: FieldErrors<TMateriaPrimaSchema>;
}

export const MateriaPrimaVarianteItem = ({
    index,
    register,
    control,
    onRemove,
    canRemove,
    unidadesMedida,
    setValue,
    errors,
}: MateriaPrimaVarianteItemProps) => {
    const unidadCompra = useWatch({
        control,
        name: `variantes.${index}.unidad_compra`,
    });

    const unidadEmpaque = useWatch({
        control,
        name: `variantes.${index}.unidad_medida_empaque_estandar`,
    });

    const unidadOptions = useMemo(() => unidadesMedida?.map(u => ({
        value: u.id,
        label: `${u.nombre_completo} (${u.abreviatura})`
    })) || [], [unidadesMedida]);

    return (
        <div className="p-6 border rounded-xl space-y-6 relative bg-card shadow-sm hover:shadow-md transition-shadow">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => onRemove(index)}
                disabled={!canRemove}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <FormInput
                    label="Nombre Variante"
                    required
                    {...register(`variantes.${index}.nombre_variante`)}
                    placeholder="Ej: Saco 50kg"
                    error={errors.variantes?.[index]?.nombre_variante?.message}
                />

                <FormSelect
                    label="Unidad de Compra"
                    required
                    value={unidadCompra}
                    onValueChange={(v) => setValue(`variantes.${index}.unidad_compra`, parseInt(v), { shouldValidate: true })}
                    options={unidadOptions}
                    placeholder="Seleccionar unidad"
                    triggerClassName="w-full"
                    error={errors.variantes?.[index]?.unidad_compra?.message}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput
                    label="Precio Divisa ($)"
                    type="number"
                    step="0.01"
                    {...register(`variantes.${index}.precio_compra_divisa`, { valueAsNumber: true })}
                    placeholder="0.00"
                    required
                    error={errors.variantes?.[index]?.precio_compra_divisa?.message}
                />
                <FormInput
                    label="Precio Local"
                    type="number"
                    step="0.01"
                    {...register(`variantes.${index}.precio_compra_local`, { valueAsNumber: true })}
                    placeholder="0.00"
                    required
                    error={errors.variantes?.[index]?.precio_compra_local?.message}
                />
                <FormInput
                    label="SKU variante"
                    type="text"
                    {...register(`variantes.${index}.SKU_variante`)}
                    placeholder="EJ: MAT-HAR-001-CAJA"
                    error={errors.variantes?.[index]?.SKU_variante?.message}
                />
            </div>

            <div className="pt-4 border-t space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Empaque Estándar <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-muted rounded">Opcional</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                        label="Nombre Empaque"
                        {...register(`variantes.${index}.nombre_empaque_estandar`)}
                        placeholder="Ej: Saco"
                        error={errors.variantes?.[index]?.nombre_empaque_estandar?.message}
                    />

                    <FormInput
                        label="Cantidad"
                        type="number"
                        step="0.01"
                        {...register(`variantes.${index}.cantidad_empaque_estandar`, { valueAsNumber: true })}
                        placeholder="0.00"
                        error={errors.variantes?.[index]?.cantidad_empaque_estandar?.message}
                    />

                    <FormSelect
                        label="Unidad Empaque"
                        value={unidadEmpaque ?? ""}
                        onValueChange={(v) => setValue(`variantes.${index}.unidad_medida_empaque_estandar`, parseInt(v), { shouldValidate: true })}
                        options={unidadOptions}
                        triggerClassName='w-full'
                        placeholder="Seleccionar"
                        error={errors.variantes?.[index]?.unidad_medida_empaque_estandar?.message}
                    />
                </div>
            </div>
        </div>
    );
};

