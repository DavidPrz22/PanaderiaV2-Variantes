import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { MetodoDePago, RecepcionOC } from "../types/types";
import { PagoSchema, type TPagoSchema } from "../schemas/schemas";
import { ComprasFormDatePicker } from "./ComprasFormDatePicker";
import { ComprasFormSelect } from "./ComprasFormSelect";
import { useMetodosDePagoQuery } from "@/hooks/useQueryHooks";
import { cn } from "@/lib/utils";
import { useGetOrdenesCompraDetalles } from "../hooks/queries/queries";
import { useRegistrarPagoMutation } from "../hooks/mutations/mutations";
import { toast } from "sonner";
import { useComprasContext } from "@/context/ComprasContext";

interface ComprasRegistrarPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ComprasRegistrarPagoDialog = ({
  open,
  onOpenChange,
}: ComprasRegistrarPagoDialogProps) => {
  const { compraSeleccionadaId } = useComprasContext();
  const { data: { orden: ordenCompra } = { orden: undefined } } =
    useGetOrdenesCompraDetalles(compraSeleccionadaId!);
  const [selectedMoneda, setSelectedMoneda] = useState<string>("USD");

  const [tasaCambio, setTasaCambio] = useState<string>(
    ordenCompra?.tasa_cambio_aplicada.toString() || "0",
  );
  const [montoPagoRealUsd, setMontoPagoRealUsd] = useState<number>(
    ordenCompra?.monto_pendiente_pago_usd
      ? Number(ordenCompra.monto_pendiente_pago_usd)
      : Number(ordenCompra?.monto_total_oc_usd || 0),
  );
  const [montoPagoRealVes, setMontoPagoRealVes] = useState<number>(
    ordenCompra?.monto_pendiente_pago_usd
      ? Number(ordenCompra.monto_pendiente_pago_usd) *
          Number(ordenCompra?.tasa_cambio_aplicada || 0)
      : Number(ordenCompra?.monto_total_oc_usd || 0) *
          Number(ordenCompra?.tasa_cambio_aplicada || 0),
  );

  const { data: metodosDePago = [] } = useMetodosDePagoQuery();

  const { mutateAsync: registrarPago, isPending: isSubmitting } =
    useRegistrarPagoMutation();

  console.log("ordenCompra", ordenCompra);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TPagoSchema>({
    resolver: zodResolver(PagoSchema),
    defaultValues: {
      fecha_pago: new Date().toISOString().split("T")[0],
      metodo_pago: ordenCompra?.metodo_pago.id,
      monto_pago_usd: montoPagoRealUsd,
      monto_pago_ves: montoPagoRealVes,
      moneda: "USD",
      tasa_cambio_aplicada: Number(ordenCompra?.tasa_cambio_aplicada || 0),
      referencia_pago: undefined,
      notas: "",
      orden_compra_asociada: ordenCompra?.id,
    },
  });

  const getMontoOrden = (compraAsociada: number | undefined) => {
    if (compraAsociada !== undefined) {
      return (
        ordenCompra?.recepciones.find(
          (recepcion) => recepcion.id === compraAsociada,
        )?.monto_pendiente_pago_usd || 0
      );
    } else {
      return montoPagoRealUsd;
    }
  };

  const getMontoPago = (compraAsociada: number | undefined) => {
    if (compraAsociada !== undefined) {
      return (
        ordenCompra?.recepciones.find(
          (recepcion) => recepcion.id === compraAsociada,
        )?.monto_pendiente_pago_usd || 0
      );
    } else {
      return montoPagoRealUsd;
    }
  };
  const [montoEnOrden, setMontoEnOrden] = useState<number>(
    getMontoOrden(watch("compra_asociada")),
  );
  const [monto, setMonto] = useState<string>(
    getMontoPago(watch("compra_asociada")).toString(),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate payment amount in USD
  const calcularMontoUSD = () => {
    const montoNum = parseFloat(monto) || 0;
    const tasaNum = parseFloat(tasaCambio) || 0;

    if (selectedMoneda === "USD" || selectedMoneda === "EUR") {
      return montoNum;
    } else if (selectedMoneda === "VES") {
      return tasaNum > 0 ? montoNum / tasaNum : 0;
    }
    return 0;
  };

  // Calculate payment amount in VES
  const calcularMontoVES = () => {
    const montoNum = parseFloat(monto) || 0;
    const tasaNum = parseFloat(tasaCambio) || 0;

    if (selectedMoneda === "USD" || selectedMoneda === "EUR") {
      return montoNum * tasaNum;
    } else if (selectedMoneda === "VES") {
      return montoNum;
    }
    return 0;
  };

  const handleFormSubmit = async (data: TPagoSchema) => {
    try {
      await registrarPago(data);
      reset();
      onOpenChange(false);
      toast.success("Pago registrado exitosamente");
    } catch (error) {
      console.error("Error registrando pago:", error);
      toast.error("Error al registrar el pago");
    }
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMonto(value);

    const montoNum = parseFloat(value) || 0;
    const tasaNum = parseFloat(tasaCambio) || 0;

    let montoUSD = 0;
    let montoVES = 0;

    if (selectedMoneda === "USD" || selectedMoneda === "EUR") {
      montoUSD = montoNum;
      montoVES = montoNum * tasaNum;
    } else if (selectedMoneda === "VES") {
      montoUSD = tasaNum > 0 ? montoNum / tasaNum : 0;
      montoVES = montoNum;
    }

    setValue("monto_pago_usd", montoUSD);
    setValue("monto_pago_ves", montoVES);
  };

  const handleTasaCambioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTasaCambio(value);
    setValue("tasa_cambio_aplicada", parseFloat(value) || 0);

    // Recalculate USD and VES amounts when exchange rate changes
    const montoNum = parseFloat(monto) || 0;
    const tasaNum = parseFloat(value) || 0;

    let montoUSD = 0;
    let montoVES = 0;

    if (selectedMoneda === "USD" || selectedMoneda === "EUR") {
      montoUSD = montoNum;
      montoVES = montoNum * tasaNum;
    } else if (selectedMoneda === "VES") {
      montoUSD = tasaNum > 0 ? montoNum / tasaNum : 0;
      montoVES = montoNum;
    }

    setValue("monto_pago_usd", montoUSD);
    setValue("monto_pago_ves", montoVES);
  };

  const handleMonedaChange = (value: string) => {
    setSelectedMoneda(value);
    setValue("moneda", value);

    // Recalculate USD and VES amounts when currency changes
    const montoNum = parseFloat(monto) || 0;
    const tasaNum = parseFloat(tasaCambio) || 0;

    let montoUSD = 0;
    let montoVES = 0;

    if (value === "USD" || value === "EUR") {
      montoUSD = montoNum;
      montoVES = montoNum * tasaNum;
    } else if (value === "VES") {
      montoUSD = tasaNum > 0 ? montoNum / tasaNum : 0;
      montoVES = montoNum;
    }

    setValue("monto_pago_usd", montoUSD);
    setValue("monto_pago_ves", montoVES);
  };

  const handleCompraAsociadaChange = (value: string) => {
    if (value === "pagado") {
      return;
    }

    if (value === "adelanto") {
      setMontoEnOrden(montoPagoRealUsd);
      setValue("compra_asociada", undefined);
      setMonto(montoPagoRealUsd.toString());
      return;
    }

    setValue("compra_asociada", Number(value));
    const montoPendiente =
      ordenCompra?.recepciones.find(
        (recepcion) => recepcion.id === Number(value),
      )?.monto_pendiente_pago_usd || 0;
    setMontoEnOrden(montoPendiente);
    setMonto(montoPendiente.toString());
    setValue("monto_pago_usd", montoPendiente);
    setValue("monto_pago_ves", montoPendiente * Number(tasaCambio));
  };

  useEffect(() => {
    if (ordenCompra) {
      // Calculate values directly from ordenCompra
      const newMontoPagoUsd = ordenCompra.monto_pendiente_pago_usd
        ? Number(ordenCompra.monto_pendiente_pago_usd)
        : Number(ordenCompra.monto_total_oc_usd || 0);

      const tasaCambioNum = Number(ordenCompra.tasa_cambio_aplicada || 0);
      const newMontoPagoVes =
        Math.round(newMontoPagoUsd * tasaCambioNum * 1000) / 1000;

      // Update state variables
      setMontoPagoRealUsd(newMontoPagoUsd);
      setMontoPagoRealVes(newMontoPagoVes);

      // Update form values with the newly calculated values
      setValue("fecha_pago", new Date().toISOString().split("T")[0]);
      setValue("metodo_pago", ordenCompra.metodo_pago.id);
      setValue("monto_pago_usd", newMontoPagoUsd);
      setValue("monto_pago_ves", newMontoPagoVes);
      setValue("tasa_cambio_aplicada", tasaCambioNum);
      setValue("orden_compra_asociada", ordenCompra.id);

      // Update local state
      setTasaCambio(tasaCambioNum.toString());
      setMonto(newMontoPagoUsd.toString());
      setMontoEnOrden(newMontoPagoUsd);
      setSelectedMoneda("USD");
    }
  }, [ordenCompra, setValue, open]);

  const requiereReferencia = metodosDePago.find(
    (metodo) => metodo.id === watch("metodo_pago"),
  )?.requiere_referencia;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-[var(--z-index-over-header-bar)] max-w-xl md:max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 "
        overlayClassName="z-[var(--z-index-over-header-bar)] "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Registrar Pago - Orden OC-
            {ordenCompra?.id.toString().padStart(3, "0")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Proveedor and Total Section */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Proveedor</p>
              <p className="font-semibold">
                {ordenCompra?.proveedor.nombre_proveedor}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-lg font-bold">
                ${formatCurrency(montoEnOrden)}
              </p>
            </div>
          </div>

          {/* Payment Date and Method */}
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="space-y-2">
              <ComprasFormDatePicker
                label="Fecha de Pago"
                value={watch("fecha_pago")}
                onChange={(v) => setValue("fecha_pago", v)}
              />
              {errors.fecha_pago && (
                <p className="text-sm text-red-500">
                  {errors.fecha_pago.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo_pago" className="text-sm font-medium">
                Método de Pago <span className="text-red-500">*</span>
              </Label>
              <ComprasFormSelect
                id="metodo_pago"
                value={
                  watch("metodo_pago") ? watch("metodo_pago").toString() : ""
                }
                onChange={(v: string) => setValue("metodo_pago", Number(v))}
                placeholder="Selecciona método de pago"
              >
                {metodosDePago.map((metodo: MetodoDePago) => (
                  <SelectItem key={metodo.id} value={metodo.id.toString()}>
                    {metodo.nombre_metodo}
                  </SelectItem>
                ))}
              </ComprasFormSelect>
              {errors.metodo_pago && (
                <p className="text-sm text-red-500">
                  {errors.metodo_pago.message}
                </p>
              )}
            </div>
          </div>
          {/* Compra Asociada */}
          {ordenCompra?.recepciones && ordenCompra.recepciones.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="compra_asociada" className="text-sm font-medium">
                Compra Asociada <span className="text-red-500">*</span>
              </Label>
              <ComprasFormSelect
                id="compra_asociada"
                value={
                  watch("compra_asociada")
                    ? watch("compra_asociada")?.toString() || ""
                    : "adelanto"
                }
                onChange={handleCompraAsociadaChange}
                placeholder="Selecciona compra asociada"
              >
                <SelectItem value="adelanto">Pago en adelanto</SelectItem>
                {ordenCompra?.recepciones.map((recepcion: RecepcionOC) =>
                  recepcion.pagado ? (
                    <SelectItem
                      className="text-gray-500"
                      key={recepcion.id}
                      value={"pagado"}
                    >
                      #{recepcion.id.toString()} - {recepcion.fecha_recepcion} -
                      Pagado
                    </SelectItem>
                  ) : (
                    <SelectItem
                      key={recepcion.id}
                      value={recepcion.id.toString()}
                    >
                      #{recepcion.id.toString()} - {recepcion.fecha_recepcion} -
                      ${recepcion.monto_pendiente_pago_usd}
                    </SelectItem>
                  ),
                )}
              </ComprasFormSelect>
              {errors.compra_asociada && (
                <p className="text-sm text-red-500">
                  {errors.compra_asociada.message}
                </p>
              )}
            </div>
          )}
          {/* Payment Reference */}
          {requiereReferencia && (
            <div className="space-y-2">
              <Label htmlFor="referencia_pago" className="text-sm font-medium">
                Referencia de Pago <span className="text-red-500">*</span>
              </Label>
              <Input
                id="referencia_pago"
                type="text"
                placeholder="Número de referencia, confirmación, etc."
                className="focus-visible:ring-blue-200"
                {...register("referencia_pago")}
              />
            </div>
          )}

          {/* Amount, Currency and Exchange Rate */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto" className="text-sm font-medium">
                Monto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={monto}
                onChange={handleMontoChange}
                className={cn(
                  errors.monto_pago_usd ? "border-red-500" : "",
                  "focus-visible:ring-blue-200",
                )}
              />
              {errors.monto_pago_usd && (
                <p className="text-sm text-red-500">
                  {errors.monto_pago_usd.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="moneda" className="text-sm font-medium">
                Moneda <span className="text-red-500">*</span>
              </Label>
              <Select defaultValue="USD" onValueChange={handleMonedaChange}>
                <SelectTrigger
                  className={cn(
                    errors.moneda ? "border-red-500" : "",
                    "focus-visible:ring-blue-200",
                  )}
                >
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="VES">VES - Bolívar</SelectItem>
                </SelectContent>
              </Select>
              {errors.moneda && (
                <p className="text-sm text-red-500">{errors.moneda.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tasa_cambio" className="text-sm font-medium">
                Tasa de Cambio
              </Label>
              <Input
                id="tasa_cambio"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={tasaCambio}
                onChange={handleTasaCambioChange}
                className={cn(
                  errors.tasa_cambio_aplicada ? "border-red-500" : "",
                  "focus-visible:ring-blue-200",
                )}
              />
              {errors.tasa_cambio_aplicada && (
                <p className="text-sm text-red-500">
                  {errors.tasa_cambio_aplicada.message}
                </p>
              )}
            </div>
          </div>

          {/* Payment Amount in USD and VES */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">
                Monto en USD:
              </span>
              <span className="text-lg font-bold text-blue-900">
                ${formatCurrency(calcularMontoUSD())}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">
                Monto en VES:
              </span>
              <span className="text-lg font-bold text-blue-900">
                {formatCurrency(calcularMontoVES())} VES
              </span>
            </div>
          </div>

          {/* Payment Notes */}
          <div className="space-y-2">
            <Label htmlFor="notas" className="text-sm font-medium">
              Notas del Pago
            </Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales sobre el pago..."
              {...register("notas")}
              rows={3}
              className="resize-none focus-visible:ring-blue-200"
            />
          </div>

          {/* Payment Summary */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-semibold mb-3">Resumen del Pago</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto a pagar:</span>
              <span className="font-medium">
                {monto || "0.00"} {selectedMoneda}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Método:</span>
              <span className="font-medium">
                {
                  metodosDePago.find(
                    (metodo) => metodo.id === watch("metodo_pago"),
                  )?.nombre_metodo
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">
                {watch("fecha_pago")
                  ? new Date(watch("fecha_pago")).toLocaleDateString("es-VE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white ml-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
