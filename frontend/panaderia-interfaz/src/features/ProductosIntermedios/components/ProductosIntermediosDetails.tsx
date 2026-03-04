import { useState } from "react";
import { ArrowLeft, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LotesProductoIntermedioTable } from "./lotes/ProductosIntermediosLotesTable";
import { LoteProductoIntermedioDetailsPanel } from "./lotes/ProductosIntermediosLoteDetails"

import type { LoteProductoIntermedio } from "../types/types";

import { RecipeModal } from "@/components/RecipeModal";
import { useGetProductosIntermediosDetalles } from "../hooks/queries/queries";
import { useChangeEstadoLoteProductosIntermedios } from "../hooks/mutations/productosIntermediosMutations";
import { useRecetasQuery } from "@/hooks/useQueryHooks";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";

import { useDeleteProductoIntermedioMutation } from "../hooks/mutations/productosIntermediosMutations";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface ProductoIntermedioDetailsPanelProps {
  fullScreen?: boolean;
}

type ViewMode = "details" | "loteDetails";

export const ProductosIntermediosDetalles = ({
  fullScreen = false,
}: ProductoIntermedioDetailsPanelProps) => {

  const { 
    productoIntermedioId, 
    setProductoIntermedioId, 
    setShowProductosIntermediosDetalles, 
    setShowProductosIntermediosForm,
    setUpdateRegistro
  } = useProductosIntermediosContext();

  const { data: productoIntermedio } = useGetProductosIntermediosDetalles(productoIntermedioId!);
  const { mutate: changeStatus } = useChangeEstadoLoteProductosIntermedios();
  const [viewMode, setViewMode] = useState<ViewMode>("details");
  const [selectedLote, setSelectedLote] = useState<LoteProductoIntermedio | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: recipeDetails, isLoading: isLoadingRecipe } = useRecetasQuery(productoIntermedio!.receta_producto.id, showRecipeModal);

  const { mutateAsync: deleteProductoIntermedio, isPending: isDeleting } = useDeleteProductoIntermedioMutation();
  if (!productoIntermedio) {
    if (!fullScreen) return null;
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Selecciona un producto para ver sus detalles
      </div>
    );
  }

  const { user } = useAuth();
  const canEdit = userHasPermission(user!, "edit", "productos_elaborados");
  const canDelete = userHasPermission(user!, "delete", "productos_elaborados");

  const handleViewLote = (lote: LoteProductoIntermedio) => {
    setSelectedLote(lote);
    setViewMode("loteDetails");
  };

  const handleBackToDetails = () => {
    setViewMode("details");
    setSelectedLote(null);
  };

  const handleOnCloseDetails = () => {
    setProductoIntermedioId(null);
    setSelectedLote(null);
    setViewMode("details");
  };

  const handleOnCloseLoteDetails = () => {
    setSelectedLote(null);
    setViewMode("details");
  };

  const handleEditProductoIntermedio = () => {
    setShowProductosIntermediosForm(true);
    setShowProductosIntermediosDetalles(false);
    setUpdateRegistro(true)
  }

  const handleDeleteProductoIntermedio = async () => {
    await deleteProductoIntermedio(productoIntermedio.id)
    setShowDeleteModal(false)
    handleOnCloseDetails()
  }

  // Lote Details View
  if (viewMode === "loteDetails" && selectedLote) {
    return (
      <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background`}>
        <LoteProductoIntermedioDetailsPanel
          lote={selectedLote}
          onBack={handleBackToDetails}
          onClose={handleOnCloseLoteDetails}
          onToggleStatus={(id) => changeStatus(id)}
        />
      </div>
    );
  }

  // Main Details View
  return (
    <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background flex flex-col`}>
      <ConfirmDeleteModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleDeleteProductoIntermedio}
              isPending={isDeleting}
              title={`Eliminar ${productoIntermedio.nombre_producto}`}
              description="¿Estás seguro que deseas eliminar este producto intermedio? Se eliminarán también todos los lotes asociados."
            />
      {/* Header */}

      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          {fullScreen && (
            <Button variant="ghost" size="icon" onClick={handleOnCloseDetails}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-semibold">{productoIntermedio.nombre_producto}</h2>
            <p className="text-sm text-muted-foreground">
              {productoIntermedio.categoria_producto.nombre_categoria}
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleEditProductoIntermedio}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
        {canDelete && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowDeleteModal(true)}>
              <X className="h-5 w-5" /> Eliminar
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Información General
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Unidad Producción</p>
                <p className="font-medium">{productoIntermedio.unidad_produccion_producto.nombre_completo}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">{productoIntermedio.descripcion || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fecha Creación</p>
                <p className="font-medium">{productoIntermedio.fecha_creacion_registro}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Receta</p>
                <Button variant="link" onClick={() => setShowRecipeModal(true)}>
                  {productoIntermedio.receta_producto.nombre_receta}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Variantes Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Variantes ({productoIntermedio.variantes.length})
            </h3>
            <div className="space-y-3">
              {productoIntermedio.variantes.map((variante) => (
                <div
                  key={variante.id}
                  className="border rounded-lg p-4 space-y-3 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{variante.nombre_variante}</p>
                      {variante.SKU && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {variante.SKU}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Stock</p>
                      <p
                        className={
                          variante.stock_actual <= variante.punto_reorden
                            ? "text-destructive font-medium"
                            : "font-medium"
                        }
                      >
                        {variante.stock_actual}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Punto Reorden</p>
                      <p className="font-medium">{variante.punto_reorden}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Lotes Table */}
          <LotesProductoIntermedioTable
            productoId={productoIntermedio.id}
            onViewLote={handleViewLote}
          />
        </div>
        <RecipeModal
                isOpen={showRecipeModal}
                onClose={() => setShowRecipeModal(false)}
                data={recipeDetails}
                isLoading={isLoadingRecipe}
              />
      </ScrollArea>
    </div>
  );
};
