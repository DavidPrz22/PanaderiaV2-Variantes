import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";
import { materiaPrimaSchema, type TMateriaPrimaSchema } from "../schemas/schemas";
import { type TMateriaPrima } from "../schemas/zod-types";
import { useCreateUpdateMateriaPrimaMutation } from "../hooks/mutations/materiaPrimaMutations";

import { useUnidadesMedidaQuery, useCategoriasQuery } from "@/hooks/useQueryHooks";
import { useMateriaPrimaDetallesQuery } from "../hooks/queries/materiaPrimaqueries";

import { FormHeader } from "./form-sections/FormHeader";
import { GeneralInformation } from "./form-sections/GeneralInformation";
import { VariantesSection } from "./form-sections/VariantesSection";
import { ActionBar } from "./form-sections/ActionBar";

interface CreateMateriaPrimaPanelProps {
  onClose: () => void;
  fullScreen?: boolean;
}

const createEmptyVariante = () => ({
  nombre_variante: "",
  unidad_compra: 0,
  precio_compra_divisa: 0,
  precio_compra_local: 0,
  nombre_empaque_estandar: "",
  cantidad_empaque_estandar: 0,
  unidad_medida_empaque_estandar: null,
});

const createVarianteDetalle = (materiaprimaDetalles: TMateriaPrima) => {
  return materiaprimaDetalles.variantes.map((variante) => ({
    id: variante.id,
    nombre_variante: variante.nombre_variante,
    SKU_variante: variante.SKU_variante || "",
    unidad_compra: variante.unidad_compra.id,
    precio_compra_divisa: variante.precio_compra_divisa || 0,
    precio_compra_local: variante.precio_compra_local || 0,
    nombre_empaque_estandar: variante.nombre_empaque_estandar || "",
    cantidad_empaque_estandar: variante.cantidad_empaque_estandar || 0,
    unidad_medida_empaque_estandar: variante.unidad_medida_empaque_estandar?.id || null,
  }));
};

export const CreateMateriaPrimaPanel = ({
  onClose,
  fullScreen = false,
}: CreateMateriaPrimaPanelProps) => {
  const { materiaprimaId, updateRegistro } = useMateriaPrimaContext();

  const { data: unidadesMedida = [] } = useUnidadesMedidaQuery();
  const { data: categoriasMateriaPrima = [] } = useCategoriasQuery();
  const { data: materiaprimaDetalles } = useMateriaPrimaDetallesQuery(
    materiaprimaId!,
    !!updateRegistro && !!materiaprimaId
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isDirty },
    control,
  } = useForm<TMateriaPrimaSchema>({
    resolver: zodResolver(materiaPrimaSchema),
    values: updateRegistro && materiaprimaDetalles
      ? {
        nombre: materiaprimaDetalles.nombre,
        SKU: materiaprimaDetalles.SKU || "",
        punto_reorden: materiaprimaDetalles.punto_reorden,
        unidad_medida_base: materiaprimaDetalles.unidad_medida_base.id,
        categoria: materiaprimaDetalles.categoria.id,
        descripcion: materiaprimaDetalles.descripcion || "",
        variantes: createVarianteDetalle(materiaprimaDetalles),
      }
      : {
        nombre: "",
        SKU: "",
        punto_reorden: 0,
        unidad_medida_base: 0,
        categoria: 0,
        descripcion: "",
        variantes: [createEmptyVariante()],
      },
  });

  const { mutateAsync: createUpdateMateriaPrima, isPending } = useCreateUpdateMateriaPrimaMutation(
    setError
  );

  console.log(errors);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantes",
  });



  const onSubmit = async (data: TMateriaPrimaSchema) => {
    await createUpdateMateriaPrima({ data, id: updateRegistro && materiaprimaId ? materiaprimaId : undefined });
    onClose();
  };

  return (
    <div
      className={`${fullScreen ? "h-full" : "w-[520px] border-l shadow-2xl"
        } bg-background bg-blue-50/10 flex flex-col`}
    >
      <FormHeader updateRegistro={!!updateRegistro} onClose={onClose} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-8 space-y-8 w-4xl max-w-4xl self-center "
      >
        <GeneralInformation
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          unidadesMedida={unidadesMedida}
          categoriasMateriaPrima={categoriasMateriaPrima}
        />

        <VariantesSection
          fields={fields}
          append={append}
          remove={remove}
          register={register}
          control={control}
          errors={errors}
          unidadesMedida={unidadesMedida}
          setValue={setValue}
          createEmptyVariante={createEmptyVariante}
        />

        <ActionBar
          isPending={isPending}
          isDirty={isDirty}
          updateRegistro={!!updateRegistro}
        />
      </form>
    </div>
  );
};
