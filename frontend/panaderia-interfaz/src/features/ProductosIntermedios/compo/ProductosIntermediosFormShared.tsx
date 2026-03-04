import Button from "@/components/Button";
import type { ProductosIntermediosFormSharedProps } from "@/features/ProductosIntermedios/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  productosIntermediosSchema,
  type TProductosIntermediosSchema,
} from "../schemas/schema";
import { PIFormInputContainer } from "./PIFormInputContainer";
import { PIFormSelectContainer } from "./PIFormSelectContainer";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import {
  useCreateProductosIntermediosMutation,
  useUpdateProductosIntermediosMutation,
} from "../hooks/mutations/productosIntermediosMutations";
import { PendingTubeSpinner } from "./PendingTubeSpinner";


export default function ProductosIntermediosFormShared({
  title,
  isUpdate = false,
  initialData,
  onClose,
  onSubmitSuccess,
}: ProductosIntermediosFormSharedProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TProductosIntermediosSchema>({
    resolver: zodResolver(productosIntermediosSchema),
    defaultValues:
      isUpdate && initialData
        ? {
            nombre_producto: initialData.nombre_producto,
            SKU: initialData.SKU,
            descripcion: initialData.descripcion || "",
            punto_reorden: initialData.punto_reorden,
            categoria: initialData.categoria_producto.id,
            unidad_produccion:
              initialData.unidad_produccion_producto.id,
            receta_relacionada: initialData.receta_relacionada
              ? initialData.receta_relacionada.id
              : undefined,
            tipo_medida_fisica: initialData.tipo_medida_fisica.toUpperCase() as
              | "UNIDAD"
              | "PESO"
              | "VOLUMEN",
          }
        : {
            nombre_producto: "",
            SKU: "",
            descripcion: "",
          },
  });

  const { unidadesMedida, categoriasProductoIntermedio, productoIntermedioId } =
    useProductosIntermediosContext();
  const {
    mutateAsync: createProductosIntermedios,
    isPending: isPendingCreateProductosIntermedios,
  } = useCreateProductosIntermediosMutation();
  const {
    mutateAsync: updateProductosIntermedios,
    isPending: isPendingUpdateProductosIntermedios,
  } = useUpdateProductosIntermediosMutation();

  function renderCategoriasProductoIntermedio() {
    if (isUpdate && initialData) {
      return (
        <>
          <option value={initialData.categoria_producto.id}>
            {
              categoriasProductoIntermedio.find(
                (categoria) =>
                  categoria.id === initialData.categoria_producto.id,
              )?.nombre_categoria
            }
          </option>
          {categoriasProductoIntermedio.map(
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
        {categoriasProductoIntermedio.map(
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

  function renderUnidadesMedida() {
    if (isUpdate && initialData) {
      return (
        <>
          <option value={initialData.unidad_produccion_producto.id}>
            {
              unidadesMedida.find(
                (unidad) =>
                  unidad.id === initialData.unidad_produccion_producto.id,
              )?.nombre_completo
            }
          </option>
          {unidadesMedida.map(
            ({
              id,
              nombre_completo,
            }: {
              id: number;
              nombre_completo: string;
            }) =>
              id !== initialData.unidad_produccion_producto.id && (
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

  const handleCancelButtonClick = () => {
    onClose();
  };

  const onSubmit = async (data: TProductosIntermediosSchema) => {
    if (isUpdate) {
      await updateProductosIntermedios({ id: productoIntermedioId!, data });
    } else {
      await createProductosIntermedios(data);
    }
    onSubmitSuccess();
  };

  const recetaRelacionadaValidatedData = initialData?.receta_relacionada
    ? initialData.receta_relacionada
    : false;
  return (
    <form onSubmit={handleSubmit(onSubmit)} id="productos-intermedios-form">
      <div className="flex flex-col mx-8 mt-4 rounded-md border border-gray-200 shadow-md relative">
        {(isPendingCreateProductosIntermedios ||
          isPendingUpdateProductosIntermedios) && (
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
            <PIFormInputContainer
              inputType="text"
              title="Nombre"
              name="nombre_producto"
              register={register}
              errors={errors}
            />
            <PIFormInputContainer
              inputType="text"
              title="SKU"
              name="SKU"
              register={register}
              errors={errors}
            />
            <PIFormInputContainer
              inputType="text"
              title="Receta"
              name="receta_relacionada"
              register={register}
              errors={errors}
              search={true}
              setValue={setValue}
              initialData={recetaRelacionadaValidatedData}
            />
            <PIFormInputContainer
              inputType="number"
              title="Punto de reorden"
              name="punto_reorden"
              register={register}
              errors={errors}
            />
            <PIFormSelectContainer
              title="Unidad de Producción"
              name="unidad_produccion"
              register={register}
              errors={errors}
              setValue={setValue}
            >
              {renderUnidadesMedida()}
            </PIFormSelectContainer>

            <PIFormSelectContainer
              title="Categoría"
              name="categoria"
              register={register}
              errors={errors}
            >
              {renderCategoriasProductoIntermedio()}
            </PIFormSelectContainer>

            <PIFormInputContainer
              inputType="textarea"
              title="Descripción"
              name="descripcion"
              register={register}
              errors={errors}
              optional={true}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end py-4 px-5 bg-white">
          <Button type="cancel" onClick={handleCancelButtonClick}>
            Cancelar
          </Button>
          <Button type="submit" onClick={() => {}}>
            Guardar
          </Button>
        </div>
      </div>
    </form>
  );
}
