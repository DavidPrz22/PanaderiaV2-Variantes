import { useState } from "react";

import type { DetalleOC, OrdenCompra } from "../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComprasEstadoBadge } from "./ComprasEstadoBadge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ComprasEmailModal } from "./ComprasEmailModal";
import { ComprasRegistrarPagoDialog } from "./ComprasRegistrarPagoDialog";

interface ComprasDetallesProps {
  ordenCompra: OrdenCompra;
  onClose: () => void;
}

import type { EstadosOC } from "../types/types";
import { ComprasFormTotals } from "./ComprasFormTotals";
import { useEffect } from "react";
import { useMarcarEnviadaOCMutation } from "../hooks/mutations/mutations";
import { useGetOrdenesCompraDetalles } from "../hooks/queries/queries";
import { toast } from "sonner";
import { useComprasContext } from "@/context/ComprasContext";
import { formatCurrency } from "../utils/itemHandlers";
import { PendingTubeSpinner } from "@/components/PendingTubeSpinner";
import { ComprasPDFDownload } from "./ComprasPDFDownload";

export const ComprasDetalles = ({
  ordenCompra,
  onClose,
}: ComprasDetallesProps) => {
  const [buttonsStates, setButtonsStates] = useState<EstadosOC>(
    ordenCompra.estado_oc.nombre_estado as EstadosOC,
  );
  const [showRegistrarPagoDialog, setShowRegistrarPagoDialog] = useState(false);
  const {
    mutateAsync: marcarEnviadaOCMutation,
    isPending: isLoadingMarcarEnviadaOCPending,
  } = useMarcarEnviadaOCMutation();

  const {
    setShowRecepcionForm,
    setShowOrdenCompraDetalles,
    compraSeleccionadaId,
  } = useComprasContext();

  const { isFetching: isFetchingOrdenCompraDetalles } =
    useGetOrdenesCompraDetalles(compraSeleccionadaId!);

  useEffect(() => {
    if (ordenCompra) {
      setButtonsStates(ordenCompra.estado_oc.nombre_estado as EstadosOC);
    }
  }, [ordenCompra]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Use usePDF hook for better control over PDF generation
  // Memoize the document to avoid re-rendering on every render
  // const pdfDocument = useMemo(
  //   () => <OrdenCompraPDF ordenCompra={ordenCompra} />,
  //   [ordenCompra],
  // );

  // const [instance] = usePDF({ document: pdfDocument });

  // // Debug logging
  // useEffect(() => {
  //   if (instance.error) {
  //     console.error("PDF Generation Error:", instance.error);
  //   }
  //   if (instance.url) {
  //     console.log("PDF Generated Successfully:", instance.url);
  //   }
  // }, [instance.error, instance.url]);

  // const handleDownloadPDF = () => {
  //   if (instance.url) {
  //     const link = document.createElement("a");
  //     link.href = instance.url;
  //     link.download = `orden-compra-${ordenCompra.id}.pdf`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } else if (instance.error) {
  //     console.error("Cannot download PDF:", instance.error);
  //     alert("Error al generar el PDF. Por favor, intenta nuevamente.");
  //   } else {
  //     console.warn("PDF URL not available yet. Loading:", instance.loading);
  //   }
  // };

  const handleMarcarEnviadaOC = async (
    mutateAsync: () => Promise<{ message: string }>,
  ) => {
    try {
      const response = await mutateAsync();
      if (response.message) {
        toast.success(response.message);
        setButtonsStates("Enviada");
      }
    } catch (error) {
      console.error("Error marking order as sent:", error);
      toast.error("Error marcando orden como enviada");
    }
  };

  const handleButtonStates = (estado: EstadosOC) => {
    const isPaymentComplete = ordenCompra.monto_pendiente_pago_usd === 0;

    switch (estado) {
      case "Borrador":
        return (
          <>
            <ComprasEmailModal datos_proveedor={ordenCompra.proveedor} />
            <Button
              className="cursor-pointer bg-amber-600 text-white hover:bg-amber-700"
              onClick={() =>
                handleMarcarEnviadaOC(() =>
                  marcarEnviadaOCMutation(ordenCompra.id),
                )
              }
              disabled={isLoadingMarcarEnviadaOCPending}
            >
              Marcar como Enviada
            </Button>
          </>
        );
      case "Enviada":
        return (
          <>
            <Button
              variant="outline"
              className="cursor-pointer font-semibold"
              onClick={() => {
                setShowRecepcionForm(true);
                setShowOrdenCompraDetalles(false);
              }}
            >
              Recibir
            </Button>
            <Button
              className="cursor-pointer bg-green-600 text-white font-semibold hover:bg-green-700"
              onClick={() => setShowRegistrarPagoDialog(true)}
            >
              Registrar Pago
            </Button>
          </>
        );
      case "Recibida Parcial":
        return (
          <>
            <Button
              variant="outline"
              className="cursor-pointer font-semibold"
              onClick={() => {
                setShowRecepcionForm(true);
                setShowOrdenCompraDetalles(false);
              }}
            >
              Recibir Restante
            </Button>
            {!isPaymentComplete ? (
              <Button
                className="cursor-pointer bg-green-600 text-white hover:bg-green-700"
                onClick={() => setShowRegistrarPagoDialog(true)}
              >
                Registrar Pago
              </Button>
            ) : null}
          </>
        );
      case "Recibida Completa":
        return (
          <>
            {!isPaymentComplete ? (
              <Button
                className="cursor-pointer bg-green-600 text-white hover:bg-green-700"
                onClick={() => setShowRegistrarPagoDialog(true)}
              >
                Registrar Pago
              </Button>
            ) : null}
          </>
        );
    }
  };
  //   const handleCancelOrder = async () => {
  //     try {
  //       const response = await cancelOrdenMutation(orden.id);
  //       toast.success(response.message);
  //       if (response.warning) {
  //         const lotes_expirados = response.lotes_expirados ? response.lotes_expirados.map((lote : {lote_expirado: number, producto: string, fecha_caducidad: string}) => `Lote expirado id: ${lote.lote_expirado} \n Para el producto: ${lote.producto} \n Con fecha de caducidad: ${lote.fecha_caducidad}`) : [];
  //         toast.warning(response.warning + "\n" + lotes_expirados.join("\n"), {
  //           duration: 5000,
  //         });
  //       }
  //       setShowCancelDialog(false);
  //       setEstadoPendiente("Cancelado");
  //     } catch (error) {
  //       console.error("Error canceling order:", error);
  //       toast.error("Error cancelando orden");
  //     }
  //   };

  return (
    <>
      <div className="flex items-center justify-center mx-8 py-5 relative">
        {isFetchingOrdenCompraDetalles && (
          <PendingTubeSpinner
            size={20}
            extraClass="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white opacity-50 z-50"
          />
        )}

        <Card className="w-full max-w-6xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b sticky top-0 bg-card z-10">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl font-bold">
                Orden de Compra #{ordenCompra.id}
              </CardTitle>
              <ComprasEstadoBadge
                estadoCompras={
                  ordenCompra.estado_oc
                    ? (ordenCompra.estado_oc.nombre_estado as EstadosOC)
                    : "Borrador"
                }
              />
            </div>
            <div className="flex items-center gap-2">
              {handleButtonStates(buttonsStates)}
              <div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Orden</p>
                <p className="font-medium">
                  {formatDate(ordenCompra.fecha_emision_oc)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Método de Pago</p>
                <p className="font-medium">
                  {ordenCompra.metodo_pago.nombre_metodo}
                </p>
              </div>
              {ordenCompra.direccion_envio && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Dirección de Envío
                  </p>
                  <p className="font-medium">{ordenCompra.direccion_envio}</p>
                </div>
              )}
              {ordenCompra.terminos_pago && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Términos de Pago
                  </p>
                  <p className="font-medium">{ordenCompra.terminos_pago}</p>
                </div>
              )}
            </div>

            {/* Proveedor Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Datos del Proveedor</h3>
              <div className="grid grid-cols-2 gap-4">
                {ordenCompra.proveedor.nombre_proveedor && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nombre del Proveedor
                    </p>
                    <p className="text-sm">
                      {ordenCompra.proveedor.nombre_proveedor}
                    </p>
                  </div>
                )}

                {ordenCompra.proveedor.nombre_comercial && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nombre Comercial
                    </p>
                    <p className="text-sm">
                      {ordenCompra.proveedor.nombre_comercial}
                    </p>
                  </div>
                )}

                {ordenCompra.proveedor.email_contacto && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">
                      {ordenCompra.proveedor.email_contacto}
                    </p>
                  </div>
                )}

                {ordenCompra.proveedor.telefono_contacto && (
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="text-sm">
                      {ordenCompra.proveedor.telefono_contacto}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Lines */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Líneas de Productos</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-table-header">
                      <TableHead className="font-semibold">Producto</TableHead>
                      <TableHead className="font-semibold text-center">
                        Cantidad Solicitada
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        Unidad de Medida
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Precio Unitario
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Subtotal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordenCompra.detalles.map(
                      (item: DetalleOC, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item.producto_reventa_nombre ||
                              item.materia_prima_nombre}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.cantidad_solicitada}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.empaquetado
                              ? item.empaquetado.empaque_nombre
                              : item.unidad_medida_compra?.nombre_completo}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.costo_unitario_usd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.subtotal_linea_usd)}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Totals */}
            <ComprasFormTotals
              bcvRate={Number(ordenCompra.tasa_cambio_aplicada)}
              totalVes={Number(ordenCompra.monto_total_oc_ves)}
              totalUsd={Number(ordenCompra.monto_total_oc_usd)}
              formatCurrency={formatCurrency}
            />

            {/* Notes */}
            {ordenCompra.notas && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Notas</h3>
                <p className="text-sm text-muted-foreground">
                  {ordenCompra.notas}
                </p>
              </div>
            )}

            {/* PDF Download Button */}
            <div className="flex justify-end border-t pt-4">
              <ComprasPDFDownload ordenCompra={ordenCompra} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelOrder}
        orderId={orden.id}
        isLoadingCancelOrdenMutation={isLoadingCancelOrdenMutation}
      /> */}

      <ComprasRegistrarPagoDialog
        open={showRegistrarPagoDialog}
        onOpenChange={setShowRegistrarPagoDialog}
      />
    </>
  );
};
