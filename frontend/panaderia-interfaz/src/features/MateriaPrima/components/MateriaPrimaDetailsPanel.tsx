import { useState, useMemo } from "react";
import { ArrowLeft, Package, Calendar, Edit, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useMateriaPrimaContext,
} from "@/context/MateriaPrimaContext";
import { LotesTable } from "./Lotes/LotesTableMP";
import { LoteForm } from "./Lotes/LoteForm";
import { LoteDetailsPanel } from "./Lotes/LoteDetallesPanel";
import { toast } from "sonner";
import { useLotesMateriaPrimaQuery } from "../hooks/queries/materiaPrimaqueries";
import { useDeleteMateriaPrimaMutation } from "../hooks/mutations/materiaPrimaMutations";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import type { LoteMateriaPrimaFormResponse } from "../types/types";

import { useCategoriasQuery } from "@/hooks/useQueryHooks";
import { useMateriaPrimaDetallesQuery } from "../hooks/queries/materiaPrimaqueries";

type DetailsViewMode = "details" | "loteForm" | "loteDetails";

interface MateriaPrimaDetailsPanelProps {
  onClose: () => void;
  fullScreen?: boolean;
}

export const MateriaPrimaDetailsPanel = ({
  onClose,
  fullScreen = false,
}: MateriaPrimaDetailsPanelProps) => {
  const {
    materiaprimaId,
    setUpdateRegistro,
    setShowMateriaprimaForm,
  } = useMateriaPrimaContext();

  const [viewMode, setViewMode] = useState<DetailsViewMode>("details");
  const [selectedLote, setSelectedLote] = useState<LoteMateriaPrimaFormResponse | null>(null);
  const [editingLote, setEditingLote] = useState<LoteMateriaPrimaFormResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutateAsync: deleteMateriaPrima, isPending: isDeleting } = useDeleteMateriaPrimaMutation();

  const { data: categoriasMateriaPrima } = useCategoriasQuery();
  const { data: materiaprimaDetalles } = useMateriaPrimaDetallesQuery(materiaprimaId!);

  const { data: lotesPagination, isLoading: isLoadingLotes } = useLotesMateriaPrimaQuery(
    materiaprimaId!,
    !!materiaprimaId
  );

  const materiaPrimaLotes = useMemo(() => {
    if (!lotesPagination) return [];
    return lotesPagination.pages.flatMap(page => page.results);
  }, [lotesPagination]);

  if (!materiaprimaDetalles) return null;

  const isLowStock = (materiaprimaDetalles.stock_actual || 0) <= (materiaprimaDetalles.punto_reorden || 0);

  const getCategoriaNombre = (categoriaId: number) => {
    const categoria = categoriasMateriaPrima?.find((c) => c.id === categoriaId);
    return categoria?.nombre_categoria || "";
  };

  const handleAddLote = () => {
    setEditingLote(null);
    setViewMode("loteForm");
  };

  const handleViewLote = (lote: any) => {
    setSelectedLote(lote as LoteMateriaPrimaFormResponse);
    setViewMode("loteDetails");
  };

  const handleEditLote = () => {
    setEditingLote(selectedLote);
    setViewMode("loteForm");
  };

  const handleDeleteLoteSuccess = () => {
    toast.success("Lote eliminado correctamente");
    setSelectedLote(null);
    setViewMode("details");
  };

  const handleSaveLoteSuccess = () => {
    toast.success(editingLote ? "Lote actualizado" : "Lote creado");
    setEditingLote(null);
    setViewMode("details");
  };

  const handleBackFromLote = () => {
    setEditingLote(null);
    setSelectedLote(null);
    setViewMode("details");
  };

  const handleEditMateriaPrima = () => {
    setUpdateRegistro(true);
    setShowMateriaprimaForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (materiaprimaId) {
      await deleteMateriaPrima(materiaprimaId);
      setShowDeleteModal(false);
      onClose(); // Close details panel
      toast.success("Materia Prima eliminada correctamente");
    }
  };

  // Lote Form View
  if (viewMode === "loteForm") {
    return (
      <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background`}>
        <LoteForm
          materiaPrimaId={materiaprimaDetalles.id}
          initialData={editingLote || undefined}
          onClose={handleBackFromLote}
          onSuccess={handleSaveLoteSuccess}
        />
      </div>
    );
  }

  // Lote Details View
  if (viewMode === "loteDetails" && selectedLote) {
    return (
      <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background`}>
        <LoteDetailsPanel
          lote={selectedLote}
          onClose={handleBackFromLote}
          onEdit={handleEditLote}
          onDeleteSuccess={handleDeleteLoteSuccess}
        />
      </div>
    );
  }

  // Main Details View
  return (
    <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Detalles de Materia Prima</h2>
            <p className="text-sm text-muted-foreground">
              Información completa del registro
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(true)} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-1 text-destructive" />
            <span className="text-destructive">Eliminar</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleEditMateriaPrima}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
        title={`Eliminar ${materiaprimaDetalles.nombre}`}
        description="¿Estás seguro que deseas eliminar esta materia prima? Se eliminarán también todos los lotes asociados."
      />

      <ScrollArea className="flex-1">
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">{materiaprimaDetalles.nombre}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {getCategoriaNombre(materiaprimaDetalles.categoria?.id)}
              </Badge>
              {isLowStock && (
                <Badge variant="destructive">Stock Bajo</Badge>
              )}
              <Badge variant="outline">SKU: {materiaprimaDetalles.SKU}</Badge>
            </div>
            {materiaprimaDetalles.descripcion && (
              <p className="text-muted-foreground mt-2">
                {materiaprimaDetalles.descripcion}
              </p>
            )}
          </div>

          <Separator />

          {/* Stock Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Información de Stock
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Stock Actual</p>
                <p className={`text-3xl font-bold ${isLowStock ? "text-destructive" : ""}`}>
                  {materiaprimaDetalles.stock_actual}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    {materiaprimaDetalles.unidad_medida_base?.abreviatura}
                  </span>
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Punto Reorden</p>
                <p className="text-3xl font-bold">
                  {materiaprimaDetalles.punto_reorden}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    {materiaprimaDetalles.unidad_medida_base?.abreviatura}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details Table */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Detalles Generales
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Unidad Base</span>
                <span className="font-medium">
                  {materiaprimaDetalles.unidad_medida_base?.nombre_completo}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Categoría</span>
                <span className="font-medium">
                  {materiaprimaDetalles.categoria?.nombre_categoria}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b items-center">
                <span className="text-muted-foreground">Fecha Registro</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {materiaprimaDetalles.fecha_creacion_registro}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lotes */}
          {isLoadingLotes ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando lotes...</p>
            </div>
          ) : (
            <LotesTable
              lotes={materiaPrimaLotes as any}
              unidadMedidaBase={materiaprimaDetalles.unidad_medida_base?.id.toString() || ""}
              onAddLote={handleAddLote}
              onViewLote={handleViewLote}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
