import type { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared";
import type { TProductoFinalSchema } from "../../schemas/schemas";
import { useUnidadesMedidaQuery, useCategoriasProductoFinalQuery } from "@/hooks/useQueryHooks";
import { Checkbox } from "@/components/ui/checkbox";

interface GeneralInformationProps {
    control: Control<TProductoFinalSchema>;
    register: UseFormRegister<TProductoFinalSchema>;
    errors: FieldErrors<TProductoFinalSchema>;
    setValue: UseFormSetValue<TProductoFinalSchema>;
    watch: UseFormWatch<TProductoFinalSchema>;
}

export const GeneralInformation = ({ control, register, errors, setValue }: GeneralInformationProps) => {
    const { data: unidadesMedida } = useUnidadesMedidaQuery();
    const { data: categorias } = useCategoriasProductoFinalQuery();

    const unidadesOptions = unidadesMedida?.map(u => ({
        value: u.id,
        label: `${u.nombre_completo} (${u.abreviatura})`
    })) || [];

    const categoriasOptions = categorias?.map(c => ({
        value: c.id,
        label: c.nombre_categoria
    })) || [];


    const setUnitLogic = (unidad: string) => {

        const unidadObj = unidadesMedida?.find(u => u.id === Number(unidad));
        if (unidadObj?.tipo_medida === "Peso") {
            setValue("tipo_medida_fisica", "PESO");
            setValue("vendible_por_medida_real", true);
        }
        if (unidadObj?.tipo_medida === "Volumen") {
            setValue("tipo_medida_fisica", "VOLUMEN");
            setValue("vendible_por_medida_real", true);
        }
        if (unidadObj?.tipo_medida === "Unidad") {
            setValue("tipo_medida_fisica", "UNIDAD");
            setValue("vendible_por_medida_real", false);
        }

    }
    return (
        <div className="space-y-4">
            <FormInput
                label="Nombre del Producto"
                placeholder="Nombre del producto final"
                required
                error={errors.nombre_producto?.message}
                {...register("nombre_producto")}
            />


            <div className="grid grid-cols-2 gap-4">
                <Controller
                    control={control}
                    name="unidad_venta"
                    render={({ field, fieldState: { error } }) => (
                        <FormSelect
                            label="Unidad de Venta"
                            placeholder="Seleccionar"
                            options={unidadesOptions}
                            triggerClassName="w-full"
                            containerClassName="w-full"
                            required
                            error={error?.message}
                            value={field.value}
                            onValueChange={(val) => {
                                field.onChange(Number(val));
                                setUnitLogic(val);
                            }}
                            className="w-full"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="unidad_produccion"
                    render={({ field, fieldState: { error } }) => (
                        <FormSelect
                            label="Unidad de Producción"
                            placeholder="Seleccionar"
                            options={unidadesOptions}
                            triggerClassName="w-full"
                            containerClassName="w-full"
                            required
                            error={error?.message}
                            value={field.value}
                            onValueChange={(val) => field.onChange(Number(val))}
                            className="w-full"
                        />
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Controller
                    control={control}
                    name="categoria"
                    render={({ field, fieldState: { error } }) => (
                        <FormSelect
                            label="Categoría"
                            placeholder="Seleccionar categoría"
                            options={categoriasOptions}
                            triggerClassName="w-full"
                            containerClassName="w-full"
                            required
                            error={error?.message}
                            value={field.value}
                            onValueChange={(val) => field.onChange(Number(val))}
                            className="w-full"
                        />
                    )}
                />
            </div>

            <FormTextarea
                label="Descripción"
                placeholder="Descripción opcional"
                rows={3}
                error={errors.descripcion?.message}
                {...register("descripcion")}
            />

            <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-6">
                    <div className="text-sm font-semibold">
                        Producto Usado en Transformaciones
                    </div>
                    <Controller
                        control={control}
                        name="usado_en_transformaciones"
                        render={({ field }) => (
                            <Checkbox
                                className="size-5 cursor-pointer"
                                checked={field.value}
                                onCheckedChange={(val) => {
                                    field.onChange(val);
                                }}
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
