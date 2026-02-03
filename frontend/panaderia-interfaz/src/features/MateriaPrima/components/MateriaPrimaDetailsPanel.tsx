import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
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
import type { TLoteMateriaPrima } from "../schemas/zod-types";

import { useCategoriasQuery } from "@/hooks/useQueryHooks";
import { useMateriaPrimaDetallesQuery } from "../hooks/queries/materiaPrimaqueries";
import {
  DetailsActionBar,
  DetailsHeaderInfo,
  StockInformation,
  GeneralDetails,
  VariantsTable,
} from "./details-sections";

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
    viewMode,
    setViewMode
  } = useMateriaPrimaContext();

  const [selectedLote, setSelectedLote] = useState<TLoteMateriaPrima | null>(null);
  const [editingLote, setEditingLote] = useState<TLoteMateriaPrima | null>(null);
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
    setSelectedLote(lote as TLoteMateriaPrima);
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
      <div className={`${fullScreen ? "h-full " : "w-[480px] border-l"} bg-background`}>
        <LoteForm
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
    <div className={`${fullScreen ? "h-full " : "w-[480px] border-l"} bg-background flex flex-col font-[Roboto]`}>
      {/* Header */}
      <DetailsActionBar
        onClose={onClose}
        onEdit={handleEditMateriaPrima}
        onDelete={() => setShowDeleteModal(true)}
        isDeleting={isDeleting}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
        title={`Eliminar ${materiaprimaDetalles.nombre}`}
        description="¿Estás seguro que deseas eliminar esta materia prima? Se eliminarán también todos los lotes asociados."
      />

      <div className="flex-1 w-4xl max-w-4xl mx-auto">
        <div className="p-8 space-y-6">
          {/* Header Info */}
          <DetailsHeaderInfo
            materiaprimaDetalles={materiaprimaDetalles}
            categoriaNombre={getCategoriaNombre(materiaprimaDetalles.categoria?.id)}
            isLowStock={isLowStock}
          />

          <Separator />

          {/* Stock Information */}
          <StockInformation
            materiaprimaDetalles={materiaprimaDetalles}
            isLowStock={isLowStock}
          />

          <Separator />

          {/* Details Table */}
          <GeneralDetails materiaprimaDetalles={materiaprimaDetalles} />

          <Separator />

          {/* Variantes */}
          <VariantsTable variantes={materiaprimaDetalles.variantes} />

          {/* Lotes */}
          {isLoadingLotes ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando lotes...</p>
            </div>
          ) : (
            <LotesTable
              lotes={materiaPrimaLotes}
              onAddLote={handleAddLote}
              onViewLote={handleViewLote}
            />
          )}
        </div>
      </div>
    </div>
  );
};
