import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { useCreateUpdateProductosReventaMutation } from "../hooks/mutations/productosReventaMutations";
import { productosReventaSchema, type TProductosReventaSchema } from "../schemas/schema";
import { FormHeader } from "./form-sections/FormHeader";
import { GeneralInformation } from "./form-sections/GeneralInformation";
import { VariantesSection } from "./form-sections/VariantesSection";
import { ActionBar } from "./form-sections/ActionBar";
import { useGetProductosReventaDetalles } from "../hooks/queries/queries";
import { useEffect } from "react";
import { PendingTubeSpinner } from "./PendingTubeSpinner";

export default function ProductosReventaForm() {
  const {
    showProductosReventaForm,
    setShowProductosReventaForm,
    updateRegistro,
    setUpdateRegistro,
    productoReventaId,
    setProductoReventaId,
  } = useProductosReventaContext();

  const { data: initialData, isLoading: isLoadingDetails } = useGetProductosReventaDetalles(productoReventaId!);

  const {
    mutateAsync: createUpdateProducto,
    isPending: isPendingCreateUpdate,
  } = useCreateUpdateProductosReventaMutation();

  const isPending = isPendingCreateUpdate;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TProductosReventaSchema>({
    resolver: zodResolver(productosReventaSchema),
    mode: "onSubmit",
    defaultValues: {
      variantes: [{
        nombre_variante: "Única",
        SKU: "",
        descripcion: "",
        precio_venta_divisa: 0,
        punto_reorden: 0,
        atributo: "CANTIDAD",
      }]
    }
  });

  useEffect(() => {
    if (updateRegistro && initialData) {
      reset({
        nombre_producto: initialData.nombre_producto,
        descripcion: initialData.descripcion || "",
        categoria: initialData.categoria.id,
        marca: initialData.marca || "",
        proveedor_preferido: initialData.proveedor_preferido?.id,
        unidad_base_inventario: initialData.unidad_base_inventario.id,
        unidad_venta: initialData.unidad_venta.id,
        factor_conversion: initialData.factor_conversion,
        es_pecedero: initialData.es_pecedero,
        variantes: initialData.variantes.map(v => ({
          id: v.id,
          nombre_variante: v.nombre_variante,
          SKU: v.SKU,
          descripcion: v.descripcion,
          precio_venta_divisa: v.precio_venta_divisa,
          precio_venta_local: v.precio_venta_local,
          punto_reorden: v.punto_reorden,
          atributo: v.atributo,
        })),
      });
    } else if (!updateRegistro) {
      reset({
        nombre_producto: "",
        descripcion: "",
        marca: "",
        es_pecedero: false,
        variantes: [{
          nombre_variante: "Única",
          SKU: "",
          descripcion: "",
          precio_venta_divisa: 0,
          punto_reorden: 0,
          atributo: "CANTIDAD",
        }]
      });
    }
  }, [updateRegistro, initialData, reset]);

  if (!showProductosReventaForm) return <></>;

  const handleClose = () => {
    setShowProductosReventaForm(false);
    setUpdateRegistro(false);
    setProductoReventaId(null);
    reset();
  };

  const onSubmit = async (data: TProductosReventaSchema) => {
    console.log(data);
    await createUpdateProducto(data);
    handleClose();
  };

  return (
    <div className="flex flex-col rounded-md relative bg-white overflow-hidden">
      <FormHeader
        onClose={handleClose}
        updateRegistro={updateRegistro}
      />
      {(isPending || isLoadingDetails) && (
        <PendingTubeSpinner
          size={28}
          extraClass="absolute bg-white opacity-50 w-full h-full z-10"
        />
      )}
        <form onSubmit={handleSubmit(onSubmit)} id="productos-reventa-form" className="w-4xl max-w-4xl mx-auto">
          <GeneralInformation
            register={register}
            errors={errors}
            control={control}
          />
          <VariantesSection
            register={register}
            errors={errors}
            control={control}
          />
      </form>
      <ActionBar
        onCancel={handleClose}
        isPending={isPending}
      />
    </div>
  );
}