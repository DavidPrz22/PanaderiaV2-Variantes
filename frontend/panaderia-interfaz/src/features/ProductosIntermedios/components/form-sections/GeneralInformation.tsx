import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared";
import type { TProductosIntermediosSchema } from "../../schemas/schema";
import { useUnidadesMedidaQuery, useCategoriasProductoIntermedioQuery } from "@/hooks/useQueryHooks";

interface GeneralInformationProps {
    control: Control<TProductosIntermediosSchema>;
    register: UseFormRegister<TProductosIntermediosSchema>;
    errors: FieldErrors<TProductosIntermediosSchema>;
}

export const GeneralInformation = ({ control, register, errors }: GeneralInformationProps) => {
    const { data: unidadesMedida } = useUnidadesMedidaQuery();
    const { data: categorias } = useCategoriasProductoIntermedioQuery();

    const unidadesOptions = unidadesMedida?.map(u => ({
        value: u.id,
        label: `${u.nombre_completo} (${u.abreviatura})`
    })) || [];

    const categoriasOptions = categorias?.map(c => ({
        value: c.id,
        label: c.nombre_categoria
    })) || [];

    return (
        <div className="space-y-4">
            <FormInput
                label="Nombre del Producto"
                placeholder="Nombre del producto intermedio"
                required
                error={errors.nombre_producto?.message}
                {...register("nombre_producto")}
            />

            <div className="grid grid-cols-2 gap-4">
                <Controller
                    control={control}
                    name="unidad_produccion"
                    render={({ field, fieldState: { error } }) => (
                        <FormSelect
                            label="Unidad Producción"
                            placeholder="Seleccionar"
                            options={unidadesOptions}
                            required
                            error={error?.message}
                            value={field.value}
                            onValueChange={(val) => field.onChange(Number(val))}
                            className="w-full"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="categoria"
                    render={({ field, fieldState: { error } }) => (
                        <FormSelect
                            label="Categoría"
                            placeholder="Seleccionar categoría"
                            options={categoriasOptions}
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
        </div>
    );
};
