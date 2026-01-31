import { ArrowLeft, Edit, Trash2, Package, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";
import type { LoteMateriaPrimaFormResponse } from "../../types/types";
import { useDeleteLoteMateriaPrimaMutation } from "../../hooks/mutations/materiaPrimaMutations";
import { useMateriaPrimaDetallesQuery } from "../../hooks/queries/materiaPrimaqueries";

interface LoteDetailsPanelProps {
  lote: LoteMateriaPrimaFormResponse;
  onClose: () => void;
  onEdit: () => void;
  onDeleteSuccess: () => void;
}

const getStatusBadgeVariant = (estado: string) => {
  switch (estado.toUpperCase()) {
    case "DISPONIBLE":
      return "default";
    case "INACTIVO":
      return "secondary";
    case "AGOTADO":
      return "outline";
    case "EXPIRADO":
      return "destructive";
    default:
      return "secondary";
  }
};

export const LoteDetailsPanel = ({
  lote,
  onClose,
  onEdit,
  onDeleteSuccess,
}: LoteDetailsPanelProps) => {
  const { materiaprimaId } = useMateriaPrimaContext();
  const { data: materiaprimaDetalles } = useMateriaPrimaDetallesQuery(materiaprimaId!);

  const deleteMutation = useDeleteLoteMateriaPrimaMutation(
    materiaprimaDetalles?.id,
    onDeleteSuccess
  );

  const unidadBase = materiaprimaDetalles?.unidad_medida_base?.abreviatura || "";

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Detalles del Lote</h2>
            <p className="text-sm text-muted-foreground">
              {materiaprimaDetalles?.nombre}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar este lote?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará el lote y actualizará el stock de la materia prima.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => lote.id && deleteMutation.mutate(lote.id)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">
                Lote #{lote.id}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(lote.estado)}>
                {lote.estado}
              </Badge>
            </div>
          </div>

          <div className="h-px bg-border my-4" />

          {/* Stock Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Información de Stock
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Stock Actual Lote</p>
                <p className="text-3xl font-bold">
                  {lote.stock_actual_lote}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    {unidadBase}
                  </span>
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Cantidad Recibida</p>
                <p className="text-3xl font-bold">
                  {lote.cantidad_recibida}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    {unidadBase}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-border my-4" />

          {/* Dates */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Fechas
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b items-center">
                <span className="text-muted-foreground">Fecha de Recepción</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {lote.fecha_recepcion.toString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b items-center">
                <span className="text-muted-foreground">Fecha de Caducidad</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {lote.fecha_caducidad.toString()}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border my-4" />

          {/* Proveedor */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Proveedor
            </h4>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Nombre</span>
              <span className="font-medium">
                {lote.proveedor.nombre_comercial || `${lote.proveedor.nombre_proveedor} ${lote.proveedor.apellido_proveedor}`}
              </span>
            </div>
          </div>

          <div className="h-px bg-border my-4" />

          {/* Costs */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Costos
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Costo Unitario Divisa
                </p>
                <p className="text-2xl font-bold text-primary">
                  ${lote.costo_unitario_usd.toFixed(2)}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Costo Unitario Local
                </p>
                <p className="text-2xl font-bold">
                  {/* Assuming local cost = usd for now as not in response */}
                  {lote.costo_unitario_usd.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
