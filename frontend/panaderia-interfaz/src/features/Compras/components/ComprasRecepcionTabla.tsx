import { useState } from "react";
import { Plus, Package, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DetalleOC, LoteRecepcion, OrdenCompra } from "../types/types";
import { CalendarClock as CalendarIcon } from "lucide-react";
import { ComprasFormDatePicker } from "./ComprasFormDatePicker";
import type { ComponentesUIRecepcion } from "../types/types";
import {
  RecepcionFormSchema,
  type TRecepcionFormSchema,
} from "../schemas/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCrearRecepcionOCMutation } from "../hooks/mutations/mutations";
import { toast } from "sonner";
import { PendingTubeSpinner } from "@/components/PendingTubeSpinner";
import { ComprasFormTotals } from "./ComprasFormTotals";
import { ComprasRecepcionTotals } from "./ComprasRecepcionTotals";
import { formatCurrency } from "../utils/itemHandlers";
import { getReceptions } from "../utils/dataFormatter";

export function ComprasRecepcion({
  ordenCompra,
  onClose,
}: {
  ordenCompra: OrdenCompra;
  onClose: () => void;
}) {
  const { mutateAsync: crearRecepcionOC, isPending: isCreatingRecepcion } =
    useCrearRecepcionOCMutation();

  const isPartial =
    ordenCompra.estado_oc.nombre_estado === "Recibida Parcial" ? true : false;

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Helper functions to calculate initial totals from ordenCompra (not from state)
  const calculateInitialTotalUSD = () => {
    const total = ordenCompra.detalles.reduce((sum, detalle) => {
      if (isPartial && detalle.cantidad_pendiente > 0) {
        return sum + detalle.cantidad_pendiente * detalle.costo_unitario_usd;
      }
      return sum + detalle.cantidad_solicitada * detalle.costo_unitario_usd;
    }, 0);
    return Math.round(total * 1000) / 1000;
  };

  const calculateInitialTotalVES = () => {
    const totalUSD = calculateInitialTotalUSD();
    return (
      Math.round(totalUSD * Number(ordenCompra.tasa_cambio_aplicada) * 1000) /
      1000
    );
  };

  const calculateInitialTotalUSDConAdelanto = () => {
    const totalUSD = calculateInitialTotalUSD();
    const adelantoUSD = Number(
      ordenCompra.pagos_en_adelantado?.monto_pago_usd || 0,
    );
    return Math.round(Math.max(0, totalUSD - adelantoUSD) * 1000) / 1000;
  };

  const calculateInitialTotalVESConAdelanto = () => {
    const totalVES = calculateInitialTotalVES();
    const adelantoVES = Number(
      ordenCompra.pagos_en_adelantado?.monto_pago_ves || 0,
    );
    return Math.round(Math.max(0, totalVES - adelantoVES) * 1000) / 1000;
  };

  // Runtime functions to calculate totals from state
  const getTotalRecepcionUSD = () => {
    const total = receptions.reduce((sum, r) => {
      const subtotal =
        r.cantidad_total_recibida * r.linea_oc.costo_unitario_usd;
      return sum + subtotal;
    }, 0);
    return Math.round(total * 1000) / 1000;
  };

  const getTotalRecepcionVES = () => {
    const totalUSD = getTotalRecepcionUSD();
    return (
      Math.round(totalUSD * Number(ordenCompra.tasa_cambio_aplicada) * 1000) /
      1000
    );
  };

  const getTotalRecepcionUSDConAdelanto = () => {
    const totalUSD = getTotalRecepcionUSD();
    const adelantoUSD = Number(
      ordenCompra.pagos_en_adelantado?.monto_pago_usd || 0,
    );
    return Math.round(Math.max(0, totalUSD - adelantoUSD) * 1000) / 1000;
  };

  const getTotalRecepcionVESConAdelanto = () => {
    const totalVES = getTotalRecepcionVES();
    const adelantoVES = Number(
      ordenCompra.pagos_en_adelantado?.monto_pago_ves || 0,
    );
    return Math.round(Math.max(0, totalVES - adelantoVES) * 1000) / 1000;
  };

  const updateMontoTotalRecibido = () => {
    const hasAdelanto = !!ordenCompra.pagos_en_adelantado;

    if (hasAdelanto) {
      setValue("monto_total_recibido_usd", getTotalRecepcionUSDConAdelanto());
      setValue("monto_total_recibido_ves", getTotalRecepcionVESConAdelanto());
    } else {
      setValue("monto_total_recibido_usd", getTotalRecepcionUSD());
      setValue("monto_total_recibido_ves", getTotalRecepcionVES());
    }
  };

  const getFormDefaultData = (): TRecepcionFormSchema => {
    const hasAdelanto = !!ordenCompra.pagos_en_adelantado;

    if (isPartial) {
      return {
        orden_compra_id: ordenCompra.id,
        fecha_recepcion: getTodayDate(),
        detalles: ordenCompra.detalles
          .filter((detalle) => detalle.cantidad_pendiente > 0)
          .map((detalle) => ({
            detalle_oc_id: detalle.id,
            lotes: [
              {
                id: 1,
                cantidad: detalle.cantidad_pendiente,
                fecha_caducidad: "",
              },
            ],
            cantidad_total_recibida: Number(detalle.cantidad_pendiente),
          })),
        recibido_parcialmente: false,
        monto_total_recibido_usd: hasAdelanto
          ? calculateInitialTotalUSDConAdelanto()
          : calculateInitialTotalUSD(),
        monto_total_recibido_ves: hasAdelanto
          ? calculateInitialTotalVESConAdelanto()
          : calculateInitialTotalVES(),
      };
    }

    return {
      orden_compra_id: ordenCompra.id,
      fecha_recepcion: getTodayDate(),
      detalles: ordenCompra.detalles.map((detalle) => ({
        detalle_oc_id: detalle.id,
        lotes: [
          { id: 1, cantidad: detalle.cantidad_solicitada, fecha_caducidad: "" },
        ],
        cantidad_total_recibida: Number(detalle.cantidad_solicitada),
      })),
      recibido_parcialmente: false,
      monto_total_recibido_usd: hasAdelanto
        ? calculateInitialTotalUSDConAdelanto()
        : calculateInitialTotalUSD(),
      monto_total_recibido_ves: hasAdelanto
        ? calculateInitialTotalVESConAdelanto()
        : calculateInitialTotalVES(),
    };
  };

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TRecepcionFormSchema>({
    resolver: zodResolver(RecepcionFormSchema),
    defaultValues: getFormDefaultData() as TRecepcionFormSchema,
  });

  const [receptions, setReceptions] = useState<ComponentesUIRecepcion[]>(
    getReceptions(ordenCompra),
  );

  const handleAddLot = (lineId: number) => {
    const newLotNumber =
      (watch("detalles").find((detalle) => detalle.detalle_oc_id === lineId)
        ?.lotes.length || 0) + 1;

    setReceptions((prev) =>
      prev.map((reception) => {
        if (reception.linea_oc.id === lineId) {
          return {
            ...reception,
            lotes: [
              ...reception.lotes,
              { id: newLotNumber, cantidad: 0, fecha_caducidad: "" },
            ],
          };
        }
        return reception;
      }),
    );

    const detalle_oc_index = watch("detalles").findIndex(
      (detalle) => detalle.detalle_oc_id === lineId,
    );

    setValue(`detalles.${detalle_oc_index}.lotes`, [
      ...(watch(`detalles.${detalle_oc_index}.lotes`) || []),
      { id: newLotNumber, cantidad: 0, fecha_caducidad: "" },
    ]);
    setValue(`detalles.${detalle_oc_index}.cantidad_total_recibida`, 0);
  };

  const handleRemoveLot = (lineId: number, lotId: number) => {
    let updatedLots: LoteRecepcion[] = [];
    let updatedCantidadTotalRecibida = 0;

    const newReceptions = receptions.map((reception) => {
      if (reception.linea_oc.id === lineId) {
        updatedLots = reception.lotes.filter((lot) => lot.id !== lotId);
        updatedCantidadTotalRecibida = updatedLots.reduce(
          (sum, lot) => sum + (Number(lot.cantidad) || 0),
          0,
        );
        return {
          ...reception,
          lotes:
            updatedLots.length > 0
              ? updatedLots
              : [{ id: 1, cantidad: 0, fecha_caducidad: "" }],
          cantidad_total_recibida: updatedCantidadTotalRecibida,
        };
      }
      return reception;
    });
    setReceptions(newReceptions);

    // Sync form state with updated lots
    updateFormDetalles(
      lineId,
      updatedLots.length > 0
        ? updatedLots
        : [{ id: 1, cantidad: 0, fecha_caducidad: "" }],
      updatedCantidadTotalRecibida,
    );
  };

  const updateFormDetalles = (
    detalle_oc_id: number,
    lotes: LoteRecepcion[],
    updatedCantidadTotalRecibida: number,
  ) => {
    const detalle_oc_index = watch("detalles").findIndex(
      (detalle) => detalle.detalle_oc_id === detalle_oc_id,
    );
    setValue(`detalles.${detalle_oc_index}.lotes`, lotes || []);
    setValue(
      `detalles.${detalle_oc_index}.cantidad_total_recibida`,
      updatedCantidadTotalRecibida,
    );
  };

  const updateReceptions = (
    lineId: number,
    lotId: number,
    field: "cantidad" | "fecha_caducidad",
    value: string | number,
  ) => {
    // Validate negative quantities - return current state if invalid
    if (field === "cantidad" && typeof value === "number" && value < 0) {
      const currentReception = receptions.find((r) => r.linea_oc.id === lineId);
      if (currentReception) {
        return {
          updatedLots: currentReception.lotes,
          updatedCantidadTotalRecibida:
            currentReception.cantidad_total_recibida,
        };
      }
      return { updatedLots: [], updatedCantidadTotalRecibida: 0 };
    }

    let updatedLots: LoteRecepcion[] = [];
    let updatedCantidadTotalRecibida = 0;

    const newReceptions = receptions.map((reception) => {
      if (reception.linea_oc.id === lineId) {
        updatedLots = reception.lotes.map((lot) => {
          if (lot.id === lotId) {
            return { ...lot, [field]: value };
          }
          return lot;
        });
        updatedCantidadTotalRecibida = updatedLots.reduce(
          (sum, lot) => sum + (Number(lot.cantidad) || 0),
          0,
        );
        return {
          ...reception,
          lotes: updatedLots,
          cantidad_total_recibida: updatedCantidadTotalRecibida,
        };
      }
      return reception;
    });

    setReceptions(newReceptions);
    return { updatedLots, updatedCantidadTotalRecibida };
  };

  const checkPartiallyReceived = (
    lineId: number,
    updatedCantidadTotalRecibida: number,
  ) => {
    if (
      isPartial &&
      updatedCantidadTotalRecibida <
      (ordenCompra.detalles.find((detalle) => detalle.id === lineId)
        ?.cantidad_pendiente || 0)
    ) {
      setValue("recibido_parcialmente", true);
    } else if (
      !isPartial &&
      updatedCantidadTotalRecibida <
      (ordenCompra.detalles.find((detalle) => detalle.id === lineId)
        ?.cantidad_solicitada || 0)
    ) {
      setValue("recibido_parcialmente", true);
    } else {
      setValue("recibido_parcialmente", false);
    }
  };

  const handleLotChange = (
    lineId: number,
    lotId: number,
    field: "cantidad" | "fecha_caducidad",
    value: string | number,
  ) => {
    // Update UI state and get the updated values
    const { updatedLots, updatedCantidadTotalRecibida } = updateReceptions(
      lineId,
      lotId,
      field,
      value,
    );

    // Sync changes with react-hook-form state
    updateFormDetalles(lineId, updatedLots, updatedCantidadTotalRecibida);
    checkPartiallyReceived(lineId, updatedCantidadTotalRecibida);
    updateMontoTotalRecibido();
  };

  const getReceivedBadgeColor = (
    cantidad_total_recibida: number,
    ordered: number,
  ) => {
    if (cantidad_total_recibida === 0) return "bg-gray-100 text-gray-700";

    if (cantidad_total_recibida == ordered) return "bg-green-100 text-green-700";

    if (cantidad_total_recibida > ordered) return "bg-red-100 text-red-700";

    return "bg-orange-100 text-orange-700";
  };

  const getTotalAllReceptions = () => {
    return receptions.reduce((sum, r) => sum + r.cantidad_total_recibida, 0);
  };

  const getProductDisplayName = (line: DetalleOC) => {
    // Display includes purchase unit - backend automatically converts to base inventory unit during reception
    if (line.materia_prima_nombre) {
      return `${line.materia_prima_nombre} (${line.unidad_medida_compra?.abreviatura})`;
    }
    if (line.producto_reventa_nombre) {
      return `${line.producto_reventa_nombre} (${line.unidad_medida_compra?.abreviatura})`;
    }
    return "Producto desconocido";
  };

  const handleSubmitReception = async (data: TRecepcionFormSchema) => {
    // Check if any product received quantity exceeds requested/pending amount
    const overflowItem = receptions.find((r) => {
      const limit = isPartial
        ? r.linea_oc.cantidad_pendiente
        : r.linea_oc.cantidad_solicitada;
      return r.cantidad_total_recibida > limit;
    });

    if (overflowItem) {
      toast.error(
        `La cantidad recibida de ${getProductDisplayName(
          overflowItem.linea_oc
        )} excede el monto solicitado o pendiente.`,
        { duration: 5000 }
      );
      return;
    }

    try {
      const response = await crearRecepcionOC(data);
      toast.success(response.message);
      onClose();
    } catch (error) {
      console.error("Error creating reception:", error);
      toast.error("Error al crear la recepción");
    }
  };

  const getErrorMessage = (
    lineId: number,
    lotIndex: number,
    field: "cantidad" | "fecha_caducidad",
  ) => {
    const lineIndex = watch("detalles").findIndex(
      (detalle) => detalle.detalle_oc_id === lineId,
    );

    if (field === "cantidad") {
      return errors.detalles?.[lineIndex]?.lotes?.[lotIndex]?.cantidad
        ? errors.detalles?.[lineIndex]?.lotes?.[lotIndex]?.cantidad.message
        : "";
    }
    if (field === "fecha_caducidad") {
      return errors.detalles?.[lineIndex]?.lotes?.[lotIndex]?.fecha_caducidad
        ? errors.detalles?.[lineIndex]?.lotes?.[lotIndex]?.fecha_caducidad
          .message
        : "";
    }
    return "";
  };

  return (
    <div className="mx-8 py-5 relative">
      {isCreatingRecepcion && (
        <PendingTubeSpinner
          size={28}
          extraClass="absolute bg-white opacity-50 w-full h-full"
        />
      )}
      <form onSubmit={handleSubmit(handleSubmitReception)}>
        <div className="text-card-foreground flex flex-col border bg-white shadow-sm rounded-lg">
          <div className="border-b px-6 py-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-4">
                  Mercancías a Recepcionar #{ordenCompra.id}
                  {watch("recibido_parcialmente") ? (
                    <span className="text-sm text-amber-500">
                      (Recibido parcialmente)
                    </span>
                  ) : null}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onClose()}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="m-6 border border-gray-300 rounded-t-lg">
            {/* Header */}
            <div
              className={`grid ${isPartial ? "grid-cols-5" : "grid-cols-3"} gap-6 border-b bg-gray-50 px-6 py-3 text-sm uppercase font-semibold tracking-wider text-gray-500 rounded-t-lg`}
            >
              <div>Producto</div>
              <div className="text-right ">Ordenado</div>
              {isPartial && <div className="text-center ">En inventario</div>}
              <div className="text-center ">Recibido</div>
              {isPartial && <div className="text-center ">Pendiente</div>}
            </div>

            {/* Rows */}
            <div className="divide-y">
              {receptions.map((reception) => (
                <div key={reception.linea_oc.id}>
                  {/* Product Row */}
                  <div
                    className={`grid ${isPartial ? "grid-cols-5" : "grid-cols-3"} gap-6 border-b px-6 py-4 items-center `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getProductDisplayName(reception.linea_oc)}
                        </p>
                      </div>
                    </div>
                    {isPartial ? (
                      <>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {reception.linea_oc.cantidad_solicitada}
                          </p>
                        </div>

                        <div className="text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-700`}
                          >
                            {reception.cantidad_en_inventario}
                          </span>
                        </div>
                        <div className="text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${getReceivedBadgeColor(reception.cantidad_total_recibida, reception.linea_oc.cantidad_pendiente)}`}
                          >
                            {reception.linea_oc.cantidad_pendiente}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold bg-red-100 text-red-700">
                            {reception.cantidad_pendiente}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {reception.linea_oc.cantidad_solicitada}
                          </p>
                        </div>

                        <div className="text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${getReceivedBadgeColor(reception.cantidad_total_recibida, reception.linea_oc.cantidad_solicitada)}`}
                          >
                            {reception.cantidad_total_recibida}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Lots Section */}
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="space-y-4">
                      {reception.lotes.map((lot, lotIndex) => (
                        <div
                          key={lot.id}
                          className="space-y-2 rounded-lg bg-white p-3 border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-600">
                              Lote {lotIndex + 1}
                            </p>
                            {reception.lotes.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveLot(reception.linea_oc.id, lot.id)
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="space-y-2 w-1/2">
                              <label className="flex items-center gap-2 text-sm text-gray-600">
                                <Package className="h-4 w-4" />
                                <span>Cantidad</span>
                              </label>
                              <Input
                                type="number"
                                min="0"
                                max={
                                  isPartial
                                    ? reception.linea_oc.cantidad_pendiente
                                    : reception.linea_oc.cantidad_solicitada
                                }
                                step="any"
                                defaultValue={lot.cantidad}
                                onKeyDown={(e) => {
                                  const isNumber = /^[0-9]$/.test(e.key);
                                  const isControlKey = [
                                    "Backspace",
                                    "Delete",
                                    "ArrowLeft",
                                    "ArrowRight",
                                    "Tab",
                                    "Enter",
                                    "Escape",
                                  ].includes(e.key);
                                  const isDecimalPoint = e.key === ".";
                                  const isCombo = e.ctrlKey || e.metaKey;

                                  if (!isNumber && !isControlKey && !isDecimalPoint && !isCombo) {
                                    e.preventDefault();
                                  }
                                }}
                                onPaste={(e) => {
                                  const pasteData = e.clipboardData.getData("text");
                                  if (!/^\d*\.?\d*$/.test(pasteData)) {
                                    e.preventDefault();
                                  }
                                }}
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                inputMode="decimal"
                                onChange={(e) => {
                                  const maxVal = isPartial
                                    ? reception.linea_oc.cantidad_pendiente
                                    : reception.linea_oc.cantidad_solicitada;
                                  let val = Number(e.target.value) || 0;

                                  if (val > maxVal) {
                                    val = maxVal;
                                    e.target.value = val.toString();
                                  }

                                  handleLotChange(
                                    reception.linea_oc.id,
                                    lot.id,
                                    "cantidad",
                                    val
                                  );
                                }}
                                placeholder="Cantidad a recibir..."
                                className="rounded border border-gray-300 px-3 py-2 text-sm focus-visible:ring-blue-200"
                              />
                            </div>

                            <div className="space-y-2 w-1/2">
                              <ComprasFormDatePicker
                                label="Caducidad"
                                value={lot.fecha_caducidad}
                                onChange={(v: string) =>
                                  handleLotChange(
                                    reception.linea_oc.id,
                                    lot.id,
                                    "fecha_caducidad",
                                    v,
                                  )
                                }
                                icon={<CalendarIcon className="h-4 w-4" />}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-red-500 text-xs">
                            <p className="col-span-1 text-red-500 text-sm">
                              {getErrorMessage(
                                reception.linea_oc.id,
                                lotIndex,
                                "cantidad",
                              )}
                            </p>
                            <p className="col-span-1 text-red-500 text-sm">
                              {getErrorMessage(
                                reception.linea_oc.id,
                                lotIndex,
                                "fecha_caducidad",
                              )}
                            </p>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddLot(reception.linea_oc.id)}
                        className=" text-blue-600 hover:text-blue-700 hover:bg-blue-100 cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Lote
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expected Totals (Purchase Order) */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                    Totales Esperados (Orden de Compra)
                  </h3>
                </div>
                <ComprasFormTotals
                  bcvRate={Number(ordenCompra.tasa_cambio_aplicada)}
                  totalVes={Number(ordenCompra.monto_total_oc_ves)}
                  totalUsd={Number(ordenCompra.monto_total_oc_usd)}
                  formatCurrency={formatCurrency}
                  showBlueBorder={true}
                />
              </div>

              {/* Reception Totals */}
              <ComprasRecepcionTotals
                tasaCambioAplicada={Number(ordenCompra.tasa_cambio_aplicada)}
                totalRecepcionUSD={getTotalRecepcionUSD()}
                totalRecepcionVES={getTotalRecepcionVES()}
                totalRecepcionUSDConAdelanto={getTotalRecepcionUSDConAdelanto()}
                totalRecepcionVESConAdelanto={getTotalRecepcionVESConAdelanto()}
                pagosEnAdelantado={ordenCompra.pagos_en_adelantado}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>

          {/* Footer with summary and save button */}
          <div className="flex justify-between items-end bg-white px-6 py-5 gap-4">
            <div className="flex-1 max-w-xs">
              <ComprasFormDatePicker
                label="Fecha de Recepción"
                value={watch("fecha_recepcion")}
                onChange={(v: string) => setValue("fecha_recepcion", v)}
                icon={<CalendarIcon className="h-4 w-4" />}
              />
              {errors.fecha_recepcion && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fecha_recepcion.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between w-70 rounded-lg bg-blue-100 p-3">
              <span className="text-sm font-medium text-blue-900">
                Total de unidades a recibir:
              </span>
              <span className="text-lg font-bold text-blue-900">
                {getTotalAllReceptions()}
              </span>
            </div>
            <Button
              type="submit"
              className=" bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded p-6.5"
              disabled={isCreatingRecepcion}
            >
              Guardar Recepción
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
