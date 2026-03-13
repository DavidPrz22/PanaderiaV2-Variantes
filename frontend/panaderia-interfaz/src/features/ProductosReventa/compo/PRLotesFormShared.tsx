import {
  loteProductosReventaSchema,
  type TLoteProductosReventaSchema,
} from "../schemas/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { TubeSpinner } from "@/assets";

import Button from "@/components/Button";
import { PRLotesInputContainer } from "./PRLotesInputContainer";
import { PRLotesSelectContainer } from "./PRLotesSelectContainer";
import type {
  LotesProductosReventa,
  Proveedor,
} from "../types/types";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { useQuery } from "@tanstack/react-query";
import { getProveedores } from "../api/api";
import { useCreateUpdateLoteProductosReventaMutation } from "../hooks/mutations/productosReventaMutations";

type PRLotesFormSharedProps = {
  title: string;
  isUpdate?: boolean;
  initialData?: LotesProductosReventa;
  onClose: () => void;
  onSubmitSuccess: () => void;
};

export const PRLotesFormShared = ({
  title,
  isUpdate = false,
  initialData,
  onClose,
  onSubmitSuccess,
}: PRLotesFormSharedProps) => {
  const { productoReventaId } = useProductosReventaContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TLoteProductosReventaSchema>({
    resolver: zodResolver(loteProductosReventaSchema),
    defaultValues: initialData ? {
      cantidad_recibida: initialData.cantidad_recibida,
      costo_unitario_usd: initialData.coste_unitario_lote_usd,
      proveedor_id: initialData.proveedor?.id || 0,
      fecha_recepcion: new Date(initialData.fecha_recepcion),
      fecha_caducidad: new Date(initialData.fecha_caducidad),
    } : {},
  });

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const { mutate: createUpdateLoteProductosReventa, isPending: isLoading } = useCreateUpdateLoteProductosReventaMutation(
    productoReventaId!,
    onSubmitSuccess,
    reset,
    isUpdate,
    initialData?.id,
  );

  async function onSubmit(data: TLoteProductosReventaSchema) {
    const formatedData = {
      ...data,
      fecha_recepcion: data.fecha_recepcion.toISOString().split('T')[0], // Format to YYYY-MM-DD
      fecha_caducidad: data.fecha_caducidad.toISOString().split('T')[0], // Format to YYYY-MM-DD
      producto_reventa: productoReventaId!,
      stock_actual_lote: data.cantidad_recibida,
      detalle_oc: null,
    };

    createUpdateLoteProductosReventa(formatedData);
  }

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

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        id="lote-pr-form"
        className="relative h-[95%]"
      >
        {isLoading ? (
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white opacity-50">
            <img src={TubeSpinner} alt="Cargando..." className="size-20" />
          </div>
        ) : (
          ""
        )}
        <div className="flex flex-col mx-8 mt-4 rounded-md border border-gray-200 h-full shadow-md">
          <div className="p-5 font-[Roboto] text-lg font-semibold border-b border-gray-300 bg-gray-50 rounded-t-md">
            {title}
          </div>
          <div className="flex flex-col justify-between h-full">
            <div className="flex flex-col gap-2 px-5 bg-white">
              <div className="flex flex-col gap-5 py-8">
                <PRLotesInputContainer
                  inputType="number"
                  title="Cantidad recibida"
                  name="cantidad_recibida"
                  register={register}
                  errors={errors}
                />
                <PRLotesInputContainer
                  inputType="number"
                  title="Costo unitario USD"
                  name="costo_unitario_usd"
                  register={register}
                  errors={errors}
                />
                <PRLotesSelectContainer
                  title="Proveedor"
                  name="proveedor_id"
                  register={register}
                  errors={errors}
                >
                  <option value="">Selecciona un proveedor</option>
                  {proveedores.map(({ id, nombre_proveedor }) => (
                    <option key={id} value={id}>
                      {nombre_proveedor}
                    </option>
                  ))}
                </PRLotesSelectContainer>

                <PRLotesInputContainer
                  inputType="date"
                  title="Fecha de recepción"
                  name="fecha_recepcion"
                  register={register}
                  errors={errors}
                />
                <PRLotesInputContainer
                  inputType="date"
                  title="Fecha de caducidad"
                  name="fecha_caducidad"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end py-4 px-5 bg-white border-t border-gray-300">
              <Button type="cancel" onClick={onClose}>
                Cerrar
              </Button>
              <Button type="submit" onClick={() => {}}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};