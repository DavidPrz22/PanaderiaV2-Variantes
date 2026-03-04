import { useForm } from "react-hook-form";
import { productosIntermediosSchema, type TProductosIntermediosSchema, type TProductosIntermediosVariantesSchema } from "../schemas/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormHeader } from "./form-sections/FormHeader";
import { GeneralInformation } from "./form-sections/GeneralInformation";
import { VariantesSection } from "./form-sections/VariantesSection";
import { useCreateProductosIntermediosMutation } from "../hooks/mutations/productosIntermediosMutations";
import { ActionBar } from "./form-sections/ActionBar";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { useGetProductosIntermediosDetalles } from "../hooks/queries/queries";
import type { ProductosIntermediosDetalles } from "../types/types";

interface CreateProductoIntermedioPanelProps {
  fullScreen?: boolean;
}

const createEmptyVariante = (): TProductosIntermediosVariantesSchema => ({
  nombre_variante: "",
  SKU: "",
  descripcion: "",
  punto_reorden: 0,
  atributo: "",
});

const initialFormState: TProductosIntermediosSchema = {
  nombre_producto: "",
  descripcion: "",
  unidad_produccion: 0,
  categoria: 0,
  variantes: [createEmptyVariante()],
}

export const ProductosIntermediosForm = ({
}: CreateProductoIntermedioPanelProps) => {

  const { updateRegistro, productoIntermedioId, setShowProductosIntermediosForm, setUpdateRegistro, setProductoIntermedioId } = useProductosIntermediosContext();
  const { mutate: createProducto, isPending } = useCreateProductosIntermediosMutation();
  const { data: producto } = useGetProductosIntermediosDetalles(productoIntermedioId!)

  const getDefaultValuesUpdate = (producto: ProductosIntermediosDetalles): TProductosIntermediosSchema => ({
    nombre_producto: producto.nombre_producto,
    descripcion: producto.descripcion,
    unidad_produccion: producto.unidad_produccion_producto.id,
    categoria: producto.categoria_producto.id,
    variantes: producto.variantes.map(v =>
    ({
      nombre_variante: v.nombre_variante,
      SKU: v.SKU,
      descripcion: v.descripcion,
      punto_reorden: v.punto_reorden,
      atributo: v.atributo
    }))

  })


  const { handleSubmit, control, register, formState: { errors }, reset} = useForm<TProductosIntermediosSchema>({
    resolver: zodResolver(productosIntermediosSchema),
    defaultValues: updateRegistro && productoIntermedioId ? getDefaultValuesUpdate(producto!) :
      initialFormState,
  });

  const handleOnClose = () => {
    setShowProductosIntermediosForm(false);
    setUpdateRegistro(false);
    setProductoIntermedioId(null);
    reset();
  }

  const onSubmit = (data: TProductosIntermediosSchema) => {
    createProducto(data, {
      onSuccess: () => {
        handleOnClose();
      }
    });
  };


  const formId = "producto-intermedio-form";

  return (
    <div className={`mx-auto bg-background flex flex-col`}>
      <FormHeader
        onClose={handleOnClose}
        title="Nuevo Producto Intermedio"
        description="Complete los campos para registrar un nuevo producto intermedio"
      />

      <div className="flex-1 overflow-y-auto">
        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 space-y-6 max-w-4xl mx-auto flex flex-col min-h-full"
        >
          <GeneralInformation control={control} register={register} errors={errors} />
          <VariantesSection control={control} register={register} errors={errors} />
        </form>
      </div>
      <ActionBar onCancel={handleOnClose} isSubmitting={isPending} formId={formId} />
    </div>
  );
};
