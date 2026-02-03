import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormInput, FormSelect, FormTextarea, SectionHeader } from "@/components/shared";
import type { TMateriaPrimaSchema } from "../../schemas/schemas";
import { useMemo } from "react";

interface GeneralInformationProps {
    register: UseFormRegister<TMateriaPrimaSchema>;
    errors: FieldErrors<TMateriaPrimaSchema>;
    watch: UseFormWatch<TMateriaPrimaSchema>;
    setValue: UseFormSetValue<TMateriaPrimaSchema>;
    unidadesMedida: any[];
    categoriasMateriaPrima: any[];
}

export const GeneralInformation = ({
    register,
    errors,
    watch,
    setValue,
    unidadesMedida,
    categoriasMateriaPrima,
}: GeneralInformationProps) => {

    const unidadOptions = useMemo(() => unidadesMedida.map((u) => ({
        value: u.id,
        label: `${u.nombre_completo} (${u.abreviatura})`,
    })), [unidadesMedida]);

    const categoriaOptions = useMemo(() => categoriasMateriaPrima.map((c) => ({
        value: c.id,
        label: c.nombre_categoria,
    })), [categoriasMateriaPrima]);

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Información General"
                description="Datos principales de identificación y control"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="Nombre"
                    required
                    error={errors.nombre?.message}
                    {...register("nombre")}
                    placeholder="Ej: Harina de Trigo Todo Uso"
                />

                <FormInput
                    label="SKU"
                    required
                    error={errors.SKU?.message}
                    {...register("SKU")}
                    placeholder="Ej: MAT-HAR-001"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                    label="Unidad Medida Base"
                    required
                    error={errors.unidad_medida_base?.message}
                    placeholder="Seleccionar unidad de medida"
                    value={watch("unidad_medida_base")}
                    onValueChange={(v) => setValue("unidad_medida_base", parseInt(v), { shouldValidate: true })}
                    options={unidadOptions}
                    triggerClassName="w-full"
                />

                <FormInput
                    label="Punto de Reorden"
                    required
                    type="number"
                    step="0.01"
                    error={errors.punto_reorden?.message}
                    {...register("punto_reorden", { valueAsNumber: true })}
                />
            </div>

            <FormSelect
                label="Categoría"
                required
                error={errors.categoria?.message}
                placeholder="Seleccionar categoría"
                value={watch("categoria")}
                triggerClassName="w-full"
                containerClassName="h-60"
                onValueChange={(v) => setValue("categoria", parseInt(v), { shouldValidate: true })}
                options={categoriaOptions}
            />

            <FormTextarea
                label="Descripción"
                error={errors.descripcion?.message}
                {...register("descripcion")}
                placeholder="Detalles adicionales sobre esta materia prima..."
                rows={3}
            />
        </div>
    );
};

