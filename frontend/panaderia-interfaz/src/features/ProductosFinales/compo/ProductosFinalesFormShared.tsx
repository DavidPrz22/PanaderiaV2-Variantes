import Button from "@/components/Button";
import type { ProductosFinalesFormSharedProps } from "@/features/ProductosFinales/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";


import {
  productoFinalSchema,
  type TProductoFinalSchema,
} from "../schemas/schemas";

import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";

import { PFFormInputContainer } from "./PFFormInputContainer";
import { PFFormSelectContainer } from "./PFFormSelectContainer";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
import { useCreateProductoFinal } from "../hooks/mutations/productosFinalesMutations";
import { useUpdateProductoFinal } from "../hooks/mutations/productosFinalesMutations";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";


export default function ProductosFinalesFormShared({
  title,
  isUpdate = false,
  initialData,
  onClose,
  onSubmitSuccess,
}: ProductosFinalesFormSharedProps) {

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<TProductoFinalSchema>({
    resolver: zodResolver(productoFinalSchema),
    defaultValues: (
      isUpdate && initialData
        ? {
          nombre_producto: initialData.nombre_producto,
          tipo_medida_fisica: initialData.tipo_medida_fisica.toUpperCase() as
            | "UNIDAD"
            | "PESO"
            | "VOLUMEN",
          categoria: initialData.categoria_producto.id,
          receta_relacionada: initialData.receta_relacionada
            ? initialData.receta_relacionada.id
            : undefined,
          unidad_venta: initialData.unidad_venta_producto?.id || 0,
          unidad_produccion:
            initialData.unidad_produccion_producto.id,
          descripcion: initialData.descripcion,
          vendible_por_medida_real: initialData.vendible_por_medida_real,
          usado_en_transformaciones: initialData.usado_en_transformaciones,
          variantes: initialData.variantes.map(v => ({
            id: v.id,
            nombre_variante: v.nombre_variante,
            SKU: v.SKU || "",
            descripcion: v.descripcion || "",
            precio_venta_usd: v.precio_venta_usd || 0,
            punto_reorden: v.punto_reorden || 0,
            atributo: v.atributo || "CANTIDAD",
          }))
        }
        : {
          nombre_producto: "",
          tipo_medida_fisica: "UNIDAD",
          categoria: 0,
          unidad_venta: 0,
          unidad_produccion: 0,
          descripcion: "",
          vendible_por_medida_real: false,
          usado_en_transformaciones: false,
          variantes: [{
            nombre_variante: "",
            SKU: "",
            descripcion: "",
            precio_venta_usd: 0,
            punto_reorden: 0,
            atributo: "CANTIDAD",
          }]
        }
    ) as unknown as TProductoFinalSchema,
  });

  const { fields: fieldsVariantes, append: appendVariante, remove: removeVariante } = useFieldArray({
    control,
    name: "variantes",
  });

  const { unidadesMedida, categoriasProductoFinal, productoId } =
    useProductosFinalesContext();

  const {
    mutateAsync: createProductosFinales,
    isPending: isPendingCreateProductosFinales,
  } = useCreateProductoFinal();
  const {
    mutateAsync: updateProductosFinales,
    isPending: isPendingUpdateProductosFinales,
  } = useUpdateProductoFinal();

  function renderCategoriasProductoIntermedio() {
    if (isUpdate && initialData) {
      return (
        <>
          <option value={initialData.categoria_producto.id}>
            {
              categoriasProductoFinal.find(
                (categoria) =>
                  categoria.id === initialData.categoria_producto.id,
              )?.nombre_categoria
            }
          </option>
          {categoriasProductoFinal.map(
            ({
              id,
              nombre_categoria,
            }: {
              id: number;
              nombre_categoria: string;
            }) =>
              id !== initialData.categoria_producto.id && (
                <option key={id} value={id}>
                  {nombre_categoria}
                </option>
              ),
          )}
        </>
      );
    }

    return (
      <>
        <option value="">Seleccione una categoria</option>
        {categoriasProductoFinal.map(
          ({
            id,
            nombre_categoria,
          }: {
            id: number;
            nombre_categoria: string;
          }) => (
            <option key={id} value={id}>
              {nombre_categoria}
            </option>
          ),
        )}
      </>
    );
  }

  function renderUnidadesMedida(
    unidadType: "unidad_venta_producto" | "unidad_produccion_producto",
  ) {
    if (isUpdate && initialData) {
      const selectedUnidad = initialData[unidadType];
      return (
        <>
          {selectedUnidad && (
            <option value={selectedUnidad.id}>
              {unidadesMedida.find((unidad) => unidad.id === selectedUnidad.id)?.nombre_completo}
            </option>
          )}
          {unidadesMedida.map(
            ({ id, nombre_completo }: { id: number; nombre_completo: string }) =>
              id !== selectedUnidad?.id && (
                <option key={id} value={id}>
                  {nombre_completo}
                </option>
              ),
          )}
        </>
      );
    }
    return (
      <>
        <option value="">Seleccione una unidad de medida</option>
        {unidadesMedida.map(
          ({
            id,
            nombre_completo,
          }: {
            id: number;
            nombre_completo: string;
          }) => (
            <option key={id} value={id}>
              {nombre_completo}
            </option>
          ),
        )}
      </>
    );
  }

  const [usadoEnTransformaciones, setUsadoEnTransformaciones] = useState(initialData?.usado_en_transformaciones ?? false);

  const checkInvalidRecetaRelacionada = () => {
    if (!usadoEnTransformaciones && !watch("receta_relacionada")) return false;
    return true;
  }

  const handleCancelButtonClick = () => {
    onClose();
  };

  const onSubmit = async (data: TProductoFinalSchema) => {
    if (!checkInvalidRecetaRelacionada()) {
      toast.error("El producto debe estar relacionado con una receta");
      return;
    }

    if (isUpdate) {
      await updateProductosFinales({ id: productoId!, producto: data });
    } else {
      await createProductosFinales(data);
    }
    onSubmitSuccess();
  };

  const recetaRelacionadaValidatedData = initialData?.receta_relacionada
    ? initialData.receta_relacionada
    : false;

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="productos-finales-form">
      <div className="flex flex-col mx-8 mt-4 rounded-md border border-gray-200 shadow-md relative">
        {(isPendingUpdateProductosFinales ||
          isPendingCreateProductosFinales) && (
            <PendingTubeSpinner
              size={28}
              extraClass="absolute bg-white opacity-50 w-full h-full"
            />
          )}
        <div className="p-5 font-[Roboto] text-lg font-semibold border-b border-gray-300 bg-gray-50 rounded-t-md">
          {title}
        </div>
        <div className="flex flex-col gap-2 px-5 bg-white">
          <div className="flex flex-col gap-2 border-b border-gray-300 py-8">
            <PFFormInputContainer
              inputType="text"
              title="Nombre del Producto"
              name="nombre_producto"
              register={register}
              errors={errors}
            />

            <PFFormInputContainer
              title="Receta"
              inputType="text"
              name="receta_relacionada"
              register={register}
              errors={errors}
              search={true}
              setValue={setValue}
              initialData={recetaRelacionadaValidatedData}
              disabled={usadoEnTransformaciones}
            />

            <PFFormSelectContainer
              title="Unidad de Venta"
              name="unidad_venta"
              register={register}
              errors={errors}
              setValue={setValue}
            >
              {renderUnidadesMedida("unidad_venta_producto")}
            </PFFormSelectContainer>

            <PFFormSelectContainer
              title="Unidad de Producción"
              name="unidad_produccion"
              register={register}
              errors={errors}
            >
              {renderUnidadesMedida("unidad_produccion_producto")}
            </PFFormSelectContainer>

            <PFFormSelectContainer
              title="Categoria del Producto"
              name="categoria"
              register={register}
              errors={errors}
            >
              {renderCategoriasProductoIntermedio()}
            </PFFormSelectContainer>

            <PFFormInputContainer
              inputType="textarea"
              title="Descripción"
              name="descripcion"
              register={register}
              errors={errors}
              optional
            />

            <div className="flex items-center gap-6">
              <div className="font-[Roboto] text-sm font-semibold">
                Producto Usado en Transformaciones
              </div>
              <Checkbox
                className="size-5 cursor-pointer"
                checked={usadoEnTransformaciones}
                onCheckedChange={() => {
                  setUsadoEnTransformaciones(!usadoEnTransformaciones);
                  setValue('receta_relacionada', null)
                  setValue('usado_en_transformaciones', !usadoEnTransformaciones)
                  const input: HTMLInputElement | null = document.querySelector('input[data-input="search"]')
                  if (input) input.value = ''
                }}
              />
            </div>
          </div>

          {/* Variantes */}
          <div className="mt-8 border-b border-gray-300 pb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-blue-800">Variantes</h3>
              <Button type="add" onClick={() => appendVariante({ nombre_variante: '', SKU: '', descripcion: '', precio_venta_usd: 0, punto_reorden: 0, atributo: 'CANTIDAD' })}>
                + Variante
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {fieldsVariantes.map((v, index) => (
                <div key={v.id} className="border border-gray-200 p-4 rounded-md shadow-sm bg-gray-50 flex flex-col gap-4 relative">
                  {fieldsVariantes.length > 1 && (
                    <button type="button" onClick={() => removeVariante(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold">X</button>
                  )}
                  <PFFormInputContainer
                    title="Nombre Variante"
                    inputType="text"
                    name={`variantes.${index}.nombre_variante` as any}
                    register={register}
                    errors={errors}
                  />
                  <PFFormInputContainer
                    title="SKU Variante"
                    inputType="text"
                    name={`variantes.${index}.SKU` as any}
                    register={register}
                    errors={errors}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <PFFormInputContainer
                      title="Precio Venta (USD)"
                      inputType="number"
                      name={`variantes.${index}.precio_venta_usd` as any}
                      register={register}
                      errors={errors}
                    />
                    <PFFormInputContainer
                      title="Punto Reorden"
                      inputType="number"
                      name={`variantes.${index}.punto_reorden` as any}
                      register={register}
                      errors={errors}
                    />
                  </div>
                  <PFFormInputContainer
                    title="Atributo Variante"
                    inputType="text"
                    name={`variantes.${index}.atributo` as any}
                    register={register}
                    errors={errors}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
        <div className="flex gap-2 justify-end py-4 px-5 bg-white">
          <Button type="cancel" onClick={handleCancelButtonClick}>
            Cancelar
          </Button>
          <Button type="submit" onClick={() => { }}>
            Guardar
          </Button>
        </div>
      </div>
    </form>
  );
}
