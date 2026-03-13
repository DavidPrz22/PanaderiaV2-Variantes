import Button from "@/components/Button";
import type { ProductosReventaFormSharedProps } from "../types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  productosReventaSchema,
  type TProductosReventaSchema,
} from "../schemas/schema";
import { PRFormInputContainer } from "./PRFormInputContainer";
import { PRFormSelectContainer } from "./PRFormSelectContainer";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import {
  useCreateProductosReventaMutation,
  useUpdateProductosReventaMutation,
} from "../hooks/mutations/productosReventaMutations";
import { PendingTubeSpinner } from "./PendingTubeSpinner";

export default function ProductosReventaFormShared({
  title,
  isUpdate = false,
  initialData,
  onClose,
  onSubmitSuccess,
}: ProductosReventaFormSharedProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TProductosReventaSchema>({
    resolver: zodResolver(productosReventaSchema),
    mode: 'onSubmit',
    defaultValues:
      isUpdate && initialData
        ? {
          nombre_producto: initialData.nombre_producto,
          descripcion: initialData.descripcion || "",
          SKU: initialData.SKU || "",
          categoria: initialData.categoria.id,
          marca: initialData.marca || "",
          proveedor_preferido: initialData.proveedor_preferido?.id,
          unidad_base_inventario: initialData.unidad_base_inventario.id,
          unidad_venta: initialData.unidad_venta.id,
          factor_conversion: initialData.factor_conversion,
          precio_venta_usd: initialData.precio_venta_usd,
          punto_reorden: initialData.punto_reorden,
          perecedero: initialData.perecedero,
          precio_compra_usd: initialData.precio_compra_usd,
        }
        : {
          nombre_producto: "",
          descripcion: "",
          SKU: "",
          marca: "",
          proveedor_preferido: undefined,
          perecedero: false,
        },
  });

  const {
    unidadesMedida,
    categoriasProductosReventa,
    proveedores,
    productoReventaId
  } = useProductosReventaContext();

  const {
    mutateAsync: createProductosReventa,
    isPending: isPendingCreateProductosReventa,
  } = useCreateProductosReventaMutation();
  const {
    mutateAsync: updateProductosReventa,
    isPending: isPendingUpdateProductosReventa,
  } = useUpdateProductosReventaMutation();

  function renderCategoriasProductosReventa() {
    if (isUpdate && initialData) {
      return (
        <>
          <option value={initialData.categoria.id}>
            {initialData.categoria.nombre_categoria}
          </option>
          {categoriasProductosReventa
            .filter(cat => cat.id !== initialData.categoria.id)
            .map(({ id, nombre_categoria }) => (
              <option key={id} value={id}>
                {nombre_categoria}
              </option>
            ))}
        </>
      );
    }

    return (
      <>
        <option value="">Seleccione una categoría</option>
        {categoriasProductosReventa.map(({ id, nombre_categoria }) => (
          <option key={id} value={id}>
            {nombre_categoria}
          </option>
        ))}
      </>
    );
  }

  function renderUnidadesMedida() {
    return (
      <>
        <option value="">Seleccione una unidad de medida</option>
        {unidadesMedida.map(({ id, nombre_completo }) => (
          <option key={id} value={id}>
            {nombre_completo}
          </option>
        ))}
      </>
    );
  }

  function renderProveedores() {
    if (isUpdate && initialData?.proveedor_preferido) {
      return (
        <>
          <option value={initialData.proveedor_preferido.id}>
            {initialData.proveedor_preferido.nombre_proveedor}
          </option>
          {proveedores
            .filter(prov => prov.id !== initialData.proveedor_preferido!.id)
            .map(({ id, nombre_proveedor }) => (
              <option key={id} value={id}>
                {nombre_proveedor}
              </option>
            ))}
        </>
      );
    }

    return (
      <>
        <option value="">Seleccione un proveedor</option>
        {proveedores.map(({ id, nombre_proveedor }) => (
          <option key={id} value={id}>
            {nombre_proveedor}
          </option>
        ))}
      </>
    );
  }

  const handleCancelButtonClick = () => {
    onClose();
  };

  const onSubmit = async (data: TProductosReventaSchema) => {
    if (isUpdate) {
      await updateProductosReventa({ id: productoReventaId!, data });
    } else {
      await createProductosReventa(data);
    }
    onSubmitSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="productos-reventa-form">
      <div className="flex flex-col mx-8 mt-4 rounded-md border border-gray-200 shadow-md relative">
        {(isPendingCreateProductosReventa || isPendingUpdateProductosReventa) && (
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
            <PRFormInputContainer
              inputType="text"
              title="Nombre del producto"
              name="nombre_producto"
              register={register}
              errors={errors}
            />
            <PRFormInputContainer
              inputType="text"
              title="SKU"
              name="SKU"
              register={register}
              errors={errors}
            />

            <PRFormSelectContainer
              title="Categoría"
              name="categoria"
              register={register}
              errors={errors}
            >
              {renderCategoriasProductosReventa()}
            </PRFormSelectContainer>
            <PRFormInputContainer
              inputType="number"
              title="Precio venta USD"
              name="precio_venta_usd"
              register={register}
              errors={errors}
            />
            <PRFormInputContainer
              inputType="number"
              title="Precio de compra por unidad (USD)"
              name="precio_compra_usd"
              register={register}
              errors={errors}
              optional={true}
            />
            <PRFormInputContainer
              inputType="number"
              title="Punto de Reorden"
              name="punto_reorden"
              register={register}
              errors={errors}
            />
            <PRFormInputContainer
              inputType="text"
              title="Marca"
              name="marca"
              register={register}
              errors={errors}
              optional={true}
            />
            <PRFormSelectContainer
              title="Proveedor preferido"
              name="proveedor_preferido"
              register={register}
              errors={errors}
              optional={true}
            >
              {renderProveedores()}
            </PRFormSelectContainer>
            <PRFormSelectContainer
              title="Unidad base inventario"
              name="unidad_base_inventario"
              register={register}
              errors={errors}
            >
              {renderUnidadesMedida()}
            </PRFormSelectContainer>
            <PRFormSelectContainer
              title="Unidad venta"
              name="unidad_venta"
              register={register}
              errors={errors}
            >
              {renderUnidadesMedida()}
            </PRFormSelectContainer>
            <PRFormInputContainer
              inputType="number"
              title="Factor conversión"
              name="factor_conversion"
              register={register}
              errors={errors}
            />
            <PRFormSelectContainer
              title="¿Es perecedero?"
              name="perecedero"
              register={register}
              errors={errors}
            >
              <option value="">Seleccione</option>
              <option value="false">No</option>
              <option value="true">Sí</option>
            </PRFormSelectContainer>
            <PRFormInputContainer
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
          <Button type="submit" onClick={() => { }}>
            Guardar
          </Button>
        </div>
      </div>
    </form>
  );
}