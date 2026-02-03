import { Plus } from "lucide-react";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared";
import { MateriaPrimaVarianteItem } from "../MateriaPrimaVarianteItem";
import type { TMateriaPrimaSchema } from "../../schemas/schemas";

interface VariantesSectionProps {
    fields: any[];
    append: (value: any) => void;
    remove: (index: number) => void;
    register: UseFormRegister<TMateriaPrimaSchema>;
    control: Control<TMateriaPrimaSchema>;
    errors: FieldErrors<TMateriaPrimaSchema>;
    unidadesMedida: any[];
    setValue: UseFormSetValue<TMateriaPrimaSchema>;
    createEmptyVariante: () => any;
}

export const VariantesSection = ({
    fields,
    append,
    remove,
    register,
    control,
    errors,
    unidadesMedida,
    setValue,
    createEmptyVariante,
}: VariantesSectionProps) => {
    return (
        <div className="space-y-6 pt-4">
            <div className="flex items-end justify-between">
                <SectionHeader
                    title="Variantes de Compra"
                    description="Presentaciones comerciales disponibles"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append(createEmptyVariante())}
                    className="shadow-sm border-dashed gap-1.5"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Variante
                </Button>
            </div>

            <div className="space-y-6">
                {fields.map((field, index) => (
                    <MateriaPrimaVarianteItem
                        key={field.id}
                        index={index}
                        register={register}
                        control={control}
                        onRemove={remove}
                        canRemove={fields.length > 1}
                        errors={errors}
                        unidadesMedida={unidadesMedida}
                        setValue={setValue}
                    />
                ))}
            </div>
        </div>
    );
};
