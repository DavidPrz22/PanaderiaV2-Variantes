import { useEffect, useState } from "react";

import type { OrdenCompra, DetalleOC } from "../types/types";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { ComprasFormSelect } from "./ComprasFormSelect";
import {
  useGetEstadosOrdenCompraRegistro,
} from "../hooks/queries/queries";

import { useForm, useFieldArray } from "react-hook-form";
import { OrdenCompraSchema, type TOrdenCompraSchema } from "../schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ComprasFormDatePicker } from "./ComprasFormDatePicker";
import { toast } from "sonner";

import {
  useCreateOCMutation,
  useUpdateOCMutation,
} from "../hooks/mutations/mutations";
import { useComprasFormLogic } from "../hooks/useComprasFormLogic";
import {
  createNewDetalleOC,
  formatCurrency,
} from "../utils/itemHandlers";
import { useComprasContext } from "@/context/ComprasContext";
import { ComprasProductsTable } from "./ComprasProductsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useProveedoresQuery, useBCVRateQuery, useMetodosDePagoQuery } from "@/hooks/useQueryHooks";
import { X } from "lucide-react";
import { PendingTubeSpinner } from "@/components/PendingTubeSpinner";
import { ComprasFormTotals } from "./ComprasFormTotals";

interface ComprasFormProps {
  orden?: OrdenCompra;
  onClose: () => void;
}

export const ComprasForm = ({ orden, onClose }: ComprasFormProps) => {

  const { setOrdenCompra, setShowForm } = useComprasContext();

  const { data: proveedores } = useProveedoresQuery();
  const { data: metodosDePago } = useMetodosDePagoQuery();
  const [moneda, setMoneda] = useState<"USD" | "Bs">("USD");

  const { handleSubmit, setValue, watch, control } = useForm<TOrdenCompraSchema>({
    resolver: zodResolver(OrdenCompraSchema),
    defaultValues: orden
      ? {
          fecha_emision_oc: orden.fecha_emision_oc,
          fecha_entrega_esperada: orden.fecha_entrega_esperada,
          fecha_entrega_real: orden.fecha_entrega_real
            ? orden.fecha_entrega_real
            : undefined,
          estado_oc: orden.estado_oc.id,
          proveedor: orden.proveedor.id,
          metodo_pago: orden.metodo_pago.id,
          monto_total_oc_usd: orden.monto_total_oc_usd,
          monto_total_oc_ves: orden.monto_total_oc_ves,
          tasa_cambio_aplicada: orden.tasa_cambio_aplicada,
          direccion_envio: orden.direccion_envio
            ? orden.direccion_envio
            : undefined,
          terminos_pago: orden.terminos_pago ? orden.terminos_pago : undefined,
          detalles: orden.detalles.map((p, index) => ({
            id: index,
            materia_prima: p.materia_prima,
            materia_prima_nombre: p.materia_prima_nombre,
            producto_reventa: p.producto_reventa,
            producto_reventa_nombre: p.producto_reventa_nombre,
            cantidad_solicitada: Number(p.cantidad_solicitada),
            modo_compra: p.modo_compra,
            unidad_empaquetado: p.empaquetado?.id || null,
            unidad_medida_compra: p.unidad_medida_compra?.id ,
            costo_unitario_usd: Number(p.costo_unitario_usd),
            costo_unitario_ves: Number(p.costo_unitario_ves || 0),
            subtotal_linea_usd: Number(p.subtotal_linea_usd),
            subtotal_linea_ves: Number(p.subtotal_linea_ves || 0),
          })),
          notas: orden.notas ? orden.notas : undefined,
        }
      : {
          fecha_emision_oc: new Date().toISOString().split("T")[0],
          fecha_entrega_esperada: new Date().toISOString().split("T")[0],
          estado_oc: 1,
          metodo_pago: 1,
          monto_total_oc_usd: 0,
          monto_total_oc_ves: 0,
          tasa_cambio_aplicada: 0,
          direccion_envio: undefined,
          terminos_pago: undefined,
          notas: undefined,
          fecha_entrega_real: undefined,
          detalles: [],
        },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "detalles",
  });

  const isEdit = !!orden;


  const { data: estadosOrden } = useGetEstadosOrdenCompraRegistro();
  const { data: bcvRate } = useBCVRateQuery();

  const { mutateAsync: createOCMutation, isPending: isCreatingOCMutation } =
    useCreateOCMutation();
  const { mutateAsync: updateOCMutation, isPending: isUpdatingOCMutation } =
    useUpdateOCMutation();
// Items state moved up

  const formLogic = useComprasFormLogic({
    setValue,
    watch,
  });

  const {
    roundTo3,
    calculateTotalFromItems,
    prepareDataForSubmit,
    resetAmounts,
  } = formLogic;

  useEffect(() => {
    if (bcvRate) {
      setValue("tasa_cambio_aplicada", roundTo3(bcvRate.promedio));
    }
  }, [bcvRate, setValue, roundTo3]);

  useEffect(() => {
    if (orden) {
      calculateTotalFromItems(fields as DetalleOC[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = () => {
    // Use a negative unique timestamp for temporary frontend IDs to avoid collisions when deleting
    const newId = -Date.now();
    const newItem = createNewDetalleOC(newId);
    append(newItem as any);
  };

  const updateLinea = (index: number, linea: DetalleOC) => {
    update(index, linea);
    
    // We get the updated array to calculate totals
    const currentDetalles = watch("detalles");
    const updatedDetalles = [...currentDetalles];
    updatedDetalles[index] = linea;
    
    calculateTotalFromItems(updatedDetalles as DetalleOC[]);
  };

  const removeItem = (index: number) => {
    remove(index);
    
    const currentDetalles = watch("detalles");
    const updatedDetalles = currentDetalles.filter((_, i) => i !== index);
    
    if (updatedDetalles.length === 0) {
      resetAmounts();
    } else {
      calculateTotalFromItems(updatedDetalles as DetalleOC[]);
    }
  };

  const handleSubmitForm = async (data: TOrdenCompraSchema) => {
    try {
      const preparedData = prepareDataForSubmit(data);
      if (isEdit && orden) {
        const { orden: updatedOrden } = await updateOCMutation({
          id: orden!.id,
          data: preparedData,
        });
        setOrdenCompra(updatedOrden);
        setShowForm(false);
        toast.success("Orden actualizada exitosamente");
      } else {
        const { orden } = await createOCMutation(preparedData);
        setOrdenCompra(orden);
        setShowForm(false);
        toast.success("Orden creada exitosamente");
      }
    } catch (error) {
      console.error("Error creating orden compra:", error);
      toast.error(
        isEdit ? "Error al actualizar la orden" : "Error al crear la orden",
      );
    }
  };
  return (
    <div className="mx-8 py-5 relative">
      {(isCreatingOCMutation || isUpdatingOCMutation) && (
        <PendingTubeSpinner
          size={20}
          extraClass="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white opacity-50 z-50"
        />
      )}
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-card">
          <CardTitle className="text-2xl font-bold">
            {isEdit ? "Editar Orden" : "Nueva Orden"}
          </CardTitle>
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4 " />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <CardContent className="space-y-6 pt-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente">
                  Proveedor <span className="text-red-500">*</span>
                </Label>
                <ComprasFormSelect
                  id="cliente"
                  value={
                    watch("proveedor") ? watch("proveedor").toString() : ""
                  }
                  onChange={(v: string) => {
                    setValue("proveedor", Number(v));
                  }}
                  placeholder="Selecciona un cliente"
                >
                  {proveedores?.map((proveedor) => (
                    <SelectItem
                      key={proveedor.id}
                      value={proveedor.id.toString()}
                    >
                      {proveedor.nombre_proveedor}
                    </SelectItem>
                  ))}
                </ComprasFormSelect>
              </div>

              {/* Fecha de Orden */}
              <ComprasFormDatePicker
                label="Fecha de Orden"
                value={watch("fecha_emision_oc")}
                onChange={(v) => setValue("fecha_emision_oc", v)}
              />

              {/* Fecha de Entrega Solicitada */}
              <ComprasFormDatePicker
                label="Fecha de Entrega Solicitada"
                value={watch("fecha_entrega_esperada")}
                onChange={(v) => setValue("fecha_entrega_esperada", v)}
              />

              {/* Fecha de Entrega Definitiva */}
              <ComprasFormDatePicker
                label="Fecha de Entrega Definitiva"
                value={watch("fecha_entrega_real")!}
                onChange={(v) => setValue("fecha_entrega_real", v)}
                optional
              />

              {/* Estado de la Orden */}
              <div className="space-y-2">
                <Label htmlFor="estadoOrden">Estado *</Label>
                <ComprasFormSelect
                  id="estadoOrden"
                  value={
                    watch("estado_oc") ? watch("estado_oc").toString() : ""
                  }
                  placeholder="Selecciona un estado"
                  onChange={(v: string) => setValue("estado_oc", Number(v))}
                >
                  {estadosOrden?.map((estado) => (
                    <SelectItem key={estado.id} value={estado.id.toString()}>
                      {estado.nombre_estado}
                    </SelectItem>
                  ))}
                </ComprasFormSelect>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label htmlFor="payment">Método de Pago *</Label>
                <ComprasFormSelect
                  id="payment"
                  value={
                    watch("metodo_pago") ? watch("metodo_pago").toString() : ""
                  }
                  onChange={(v: string) => setValue("metodo_pago", Number(v))}
                  placeholder="Selecciona un método de pago"
                >
                  {metodosDePago?.map((metodo) => (
                    <SelectItem key={metodo.id} value={metodo.id.toString()}>
                      {metodo.nombre_metodo}
                    </SelectItem>
                  ))}
                </ComprasFormSelect>
              </div>

              {/* Referencia de Pago */}
              <div className="space-y-2">
                <Label htmlFor="payment">Terminos de Pago (Opcional)</Label>
                <Input
                  id="payment"
                  type="text"
                  value={watch("terminos_pago") ?? ""}
                  className="focus-visible:ring-blue-200 bg-gray-50"
                  onChange={(e) =>
                    setValue("terminos_pago", e.target.value || undefined)
                  }
                  placeholder="Terminos de Pago"
                />
              </div>

              {/* Direccion de Envio */}
              <div className="space-y-2">
                <Label htmlFor="payment">Direccion de Envio (Opcional)</Label>
                <Input
                  id="payment"
                  type="text"
                  value={watch("direccion_envio") ?? ""}
                  className="focus-visible:ring-blue-200 bg-gray-50"
                  onChange={(e) =>
                    setValue("direccion_envio", e.target.value || undefined)
                  }
                  placeholder="Direccion de Envio"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Productos de la Orden</h3>
              <div className="flex bg-muted p-1 rounded-md">
                <Button
                  type="button"
                  variant={moneda === "USD" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setMoneda("USD")}
                >
                  USD ($)
                </Button>
                <Button
                  type="button"
                  variant={moneda === "Bs" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setMoneda("Bs")}
                >
                  VES (Bs)
                </Button>
              </div>
            </div>

            <ComprasProductsTable
              items={fields as unknown as DetalleOC[]}
              moneda={moneda}
              tasaCambio={watch("tasa_cambio_aplicada") || 1}
              onUpdateLinea={updateLinea}
              onRemoveLinea={removeItem}
              onAddLinea={addItem}
            />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                className="focus-visible:ring-blue-200"
                value={watch("notas")}
                onChange={(e) => setValue("notas", e.target.value)}
                placeholder="Notas adicionales sobre la orden..."
                rows={3}
              />
            </div>

            {/* Totals */}
            <ComprasFormTotals
              bcvRate={bcvRate?.promedio}
              totalVes={Number(watch("monto_total_oc_ves")) || 0}
              totalUsd={Number(watch("monto_total_oc_usd")) || 0}
              formatCurrency={formatCurrency}
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end border-t pt-4">
              <Button
                type="button"
                className="cursor-pointer"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700"
              >
                {isEdit ? "Actualizar Orden" : "Crear Orden"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};
