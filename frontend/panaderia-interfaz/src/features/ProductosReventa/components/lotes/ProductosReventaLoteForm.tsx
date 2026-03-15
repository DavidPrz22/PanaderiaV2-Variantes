import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormDatePicker, FormInput, FormSelect } from "@/components/shared";
import { loteProductosReventaSchema, type TLoteProductosReventaSchema } from "../../schemas/schema";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { getProveedores } from "../../api/api";
import { useCreateUpdateLoteProductosReventaMutation } from "../../hooks/mutations/productosReventaMutations";
import { useGetProductosReventaDetalles } from "../../hooks/queries/queries";
import { PendingTubeSpinner } from "../PendingTubeSpinner";
import type { LotesProductosReventa, Proveedor, VariantesProductosReventa } from "../../types/types";
import { FormHeader } from "../form-sections/FormHeader";
import { ActionBar } from "../form-sections/ActionBar";

type ProductosReventaLoteFormProps = {
  title: string;
  isUpdate?: boolean;
  initialData?: LotesProductosReventa;
  onClose: () => void;
};

export const ProductosReventaLoteForm = ({
  isUpdate = false,
  initialData,
  onClose,
}: ProductosReventaLoteFormProps) => {
  const { productoReventaId, updateRegistro } = useProductosReventaContext();
  const { data: productDetails } = useGetProductosReventaDetalles(productoReventaId!);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<TLoteProductosReventaSchema>({
    resolver: zodResolver(loteProductosReventaSchema),
    defaultValues: initialData
      ? {
        producto_reventa_variante: initialData.producto_reventa_variante,
        cantidad_recibida: initialData.cantidad_recibida,
        coste_unitario_lote_divisa: initialData.coste_unitario_lote_divisa,
        coste_unitario_lote_local: initialData.coste_unitario_lote_local,
        proveedor_id: initialData.proveedor?.id || 0,
        fecha_recepcion: new Date(initialData.fecha_recepcion),
        fecha_caducidad: initialData.fecha_caducidad ? new Date(initialData.fecha_caducidad) : undefined,
      }
      : {
        producto_reventa_variante: productDetails?.variantes?.[0]?.id,
      },
  });

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const { mutate: createUpdateLote, isPending } =
    useCreateUpdateLoteProductosReventaMutation(productoReventaId!);

  const { data: proveedoresQuery } = useQuery({
    queryKey: ["proveedores"],
    queryFn: getProveedores,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (proveedoresQuery) {
      setProveedores(proveedoresQuery);
    }
  }, [proveedoresQuery]);

  const handleClose = () => {
    onClose();
    reset();
  };

  const onSubmit = (data: TLoteProductosReventaSchema) => {
    const formattedData = {
      ...data,
      fecha_recepcion: data.fecha_recepcion.toISOString().split("T")[0],
      fecha_caducidad: data.fecha_caducidad ? data.fecha_caducidad.toISOString().split("T")[0] : undefined,
    };

    if (isUpdate && initialData?.id) {
      createUpdateLote({
        data: formattedData,
        loteId: initialData.id
      });
    } else {
      createUpdateLote({
        data: formattedData,
        loteId: null
      });
    }
    handleClose();
  };


  const proveedoresOptions = proveedores.map((p) => ({
    value: p.id,
    label: p.nombre_proveedor,
  }));
 
  const variantOptions = productDetails?.variantes.map((v: VariantesProductosReventa) => ({
    value: v.id,
    label: v.nombre_variante,
  })) || [];

  return (
    <div className="flex flex-col rounded-md relative font-[Roboto]">
      {isPending && (
        <PendingTubeSpinner
          size={28}
          extraClass="absolute bg-white opacity-50 w-full h-full z-10"
        />
      )}
      <FormHeader updateRegistro={updateRegistro} onClose={handleClose} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="py-20 flex flex-col gap-8 w-4xl max-w-4xl mx-auto"
        id="productos-reventa-lote-form"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="producto_reventa_variante"
            render={({ field }) => (
              <FormSelect
                label="Variante de Producto"
                required
                options={variantOptions}
                value={field.value}
                onValueChange={(val) => field.onChange(Number(val))}
                triggerClassName="w-full"
                error={errors.producto_reventa_variante?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="proveedor_id"
            render={({ field }) => (
              <FormSelect
                label="Proveedor"
                required
                options={proveedoresOptions}
                value={field.value}
                onValueChange={(val) => field.onChange(Number(val))}
                error={errors.proveedor_id?.message}
                triggerClassName="w-full"
              />
            )}
          />
        </div>
        <FormInput
          label="Cantidad recibida"
          type="number"
          required
          error={errors.cantidad_recibida?.message}
          {...register("cantidad_recibida")}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Costo unitario local"
            type="number"
            required
            error={errors.coste_unitario_lote_local?.message}
            {...register("coste_unitario_lote_local")}
          />
          <FormInput
            label="Costo unitario Divisa"
            type="number"
            step="0.01"
            required
            error={errors.coste_unitario_lote_divisa?.message}
            {...register("coste_unitario_lote_divisa")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="fecha_recepcion"
            render={({ field }) => (
              <FormDatePicker
                label="Fecha de recepción"
                required
                error={errors.fecha_recepcion?.message}
                {...field}
                selected={field.value}
                onSelect={(val: Date | undefined) => field.onChange(val)}
              />
            )}
          />
          <Controller
            control={control}
            name="fecha_caducidad"
            render={({ field }) => (
              <FormDatePicker
                label="Fecha de caducidad"
                required
                error={errors.fecha_caducidad?.message}
                {...field}
                selected={field.value}
                onSelect={(val: Date | undefined) => field.onChange(val)}
              />
            )}
          />
        </div>
      </form>
      <ActionBar
        onCancel={onClose}
        isPending={isPending}
        formId="productos-reventa-lote-form"
      />
    </div>
  );
};
