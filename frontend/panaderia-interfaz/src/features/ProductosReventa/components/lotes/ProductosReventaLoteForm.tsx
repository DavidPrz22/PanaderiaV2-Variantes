import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormInput, FormSelect } from "@/components/shared";
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
  onSubmitSuccess: () => void;
};

export const ProductosReventaLoteForm = ({
  title,
  isUpdate = false,
  initialData,
  onClose,
  onSubmitSuccess,
}: ProductosReventaLoteFormProps) => {
  const { productoReventaId } = useProductosReventaContext();
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
          costo_unitario_usd: initialData.coste_unitario_lote_usd,
          costo_unitario_local: initialData.coste_unitario_lote_local,
          proveedor_id: initialData.proveedor?.id || 0,
          fecha_recepcion: new Date(initialData.fecha_recepcion),
          fecha_caducidad: new Date(initialData.fecha_caducidad),
        }
      : {
          producto_reventa_variante: productDetails?.variantes?.[0]?.id,
        },
  });

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const { mutate: createUpdateLote, isPending } =
    useCreateUpdateLoteProductosReventaMutation(
      productoReventaId!,
      onSubmitSuccess,
      reset,
      isUpdate,
      initialData?.id
    );

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

  const onSubmit = (data: TLoteProductosReventaSchema) => {
    const formattedData = {
      ...data,
      fecha_recepcion: data.fecha_recepcion.toISOString().split("T")[0],
      fecha_caducidad: data.fecha_caducidad.toISOString().split("T")[0],
      stock_actual_lote: data.cantidad_recibida,
      detalle_oc: null,
    };

    createUpdateLote(formattedData as any);
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
    <div className="flex flex-col mx-8 mt-4 rounded-md border border-gray-200 shadow-md relative bg-white overflow-hidden">
      {isPending && (
        <PendingTubeSpinner
          size={28}
          extraClass="absolute bg-white opacity-50 w-full h-full z-10"
        />
      )}
      <FormHeader title={title} />
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-4">
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
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Cantidad recibida"
            type="number"
            required
            error={errors.cantidad_recibida?.message}
            {...register("cantidad_recibida")}
          />
          <FormInput
            label="Costo unitario USD"
            type="number"
            step="0.01"
            required
            error={errors.costo_unitario_usd?.message}
            {...register("costo_unitario_usd")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Fecha de recepción"
            type="date"
            required
            error={errors.fecha_recepcion?.message}
            {...register("fecha_recepcion", { valueAsDate: true })}
          />
          <FormInput
            label="Fecha de caducidad"
            type="date"
            required
            error={errors.fecha_caducidad?.message}
            {...register("fecha_caducidad", { valueAsDate: true })}
          />
        </div>
        <ActionBar onCancel={onClose} isPending={isPending} />
      </form>
    </div>
  );
};
