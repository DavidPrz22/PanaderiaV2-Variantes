import { type UseFormRegister, type FieldErrors, type Control, Controller } from "react-hook-form";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared";
import type { TProductosReventaSchema } from "../../schemas/schema";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";

interface GeneralInformationProps {
  register: UseFormRegister<TProductosReventaSchema>;
  errors: FieldErrors<TProductosReventaSchema>;
  control: Control<TProductosReventaSchema>;
}

export const GeneralInformation = ({
  register,
  errors,
  control,
}: GeneralInformationProps) => {
  const {
    unidadesMedida,
    categoriasProductosReventa,
    proveedores,
  } = useProductosReventaContext();

  const categoriasOptions = categoriasProductosReventa.map((cat) => ({
    value: cat.id,
    label: cat.nombre_categoria,
  }));

  const unidadesOptions = unidadesMedida.map((u) => ({
    value: u.id,
    label: u.nombre_completo,
  }));

  const proveedoresOptions = proveedores.map((prov) => ({
    value: prov.id,
    label: prov.nombre_proveedor,
  }));

  return (
    <div className="flex flex-col gap-4 p-5 bg-white">
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Nombre del producto"
          required
          error={errors.nombre_producto?.message}
          {...register("nombre_producto")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="categoria"
          render={({ field }) => (
            <FormSelect
              label="Categoría"
              required
              options={categoriasOptions}
              value={field.value}
              onValueChange={(val) => field.onChange(Number(val))}
              error={errors.categoria?.message}
              triggerClassName="w-full"
            />
          )}
        />
        <Controller
          control={control}
          name="proveedor_preferido"
          render={({ field }) => (
            <FormSelect
              label="Proveedor preferido"
              options={proveedoresOptions}
              value={field.value ?? undefined}
              onValueChange={(val) => field.onChange(Number(val))}
              error={errors.proveedor_preferido?.message}
              triggerClassName="w-full"
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="unidad_base_inventario"
          render={({ field }) => (
            <FormSelect
              label="Unidad base inventario"
              required
              options={unidadesOptions}
              value={field.value}
              onValueChange={(val) => field.onChange(Number(val))}
              error={errors.unidad_base_inventario?.message}
              triggerClassName="w-full"
            />
          )}
        />
        <Controller
          control={control}
          name="unidad_venta"
          render={({ field }) => (
            <FormSelect
              label="Unidad venta"
              required
              options={unidadesOptions}
              value={field.value}
              onValueChange={(val) => field.onChange(Number(val))}
              error={errors.unidad_venta?.message}
              triggerClassName="w-full"
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Factor conversión"
          type="number"
          step="0.01"
          required
          error={errors.factor_conversion?.message}
          {...register("factor_conversion")}
        />
        <FormInput
        label="Marca"
        error={errors.marca?.message}
        {...register("marca")}
      />
        <Controller
          control={control}
          name="es_pecedero"
          render={({ field }) => (
            <FormSelect
              label="¿Es perecedero?"
              required
              options={[
                { value: "false", label: "No" },
                { value: "true", label: "Sí" },
              ]}
              value={field.value ? "true" : "false"}
              onValueChange={(val) => field.onChange(val === "true")}
              error={errors.es_pecedero?.message}
            />
          )}
        />
      </div>

      <FormTextarea
        label="Descripción"
        error={errors.descripcion?.message}
        rows={2}
        {...register("descripcion")}
      />
    </div>
  );
};
