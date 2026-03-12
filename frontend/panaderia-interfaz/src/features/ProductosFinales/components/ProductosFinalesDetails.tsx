import { useState } from "react";
import { ArrowLeft, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LotesProductosFinalesTable } from "./lotes/ProductosFinalesLotesTable";
import { ProductosFinalesLoteDetails } from "./lotes/ProductosFinalesLoteDetails"

import type { LotesProductosFinales } from "../types/types";

import { RecipeModal } from "@/components/RecipeModal";
import { useProductoFinalDetalles } from "../hooks/queries/queries";
import { useChangeEstadoLoteProductosFinales, useDeleteProductoFinal } from "../hooks/mutations/productosFinalesMutations";
import { useRecetasQuery } from "@/hooks/useQueryHooks";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";

import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface ProductosFinalesDetailsProps {
  fullScreen?: boolean;
}

type ViewMode = "details" | "loteDetails";

export const ProductosFinalesDetails = ({
  fullScreen = false,
}: ProductosFinalesDetailsProps) => {

  const {
    productoId,
    setProductoId,
    setShowProductoDetalles,
    setShowProductoForm,
    setUpdateProducto
  } = useProductosFinalesContext();

  const { data: producto } = useProductoFinalDetalles(productoId!);

  const { mutate: changeStatus } = useChangeEstadoLoteProductosFinales();
  const [viewMode, setViewMode] = useState<ViewMode>("details");
  const [selectedLote, setSelectedLote] = useState<LotesProductosFinales | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const idReceta = producto?.receta_relacionada ? producto.receta_relacionada.id : null;
  const { data: recipeDetails, isLoading: isLoadingRecipe = false } = useRecetasQuery(idReceta, showRecipeModal);

  const { mutateAsync: deleteProducto, isPending: isDeleting } = useDeleteProductoFinal();

  if (!producto) {
    if (!fullScreen) return null;
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Selecciona un producto para ver sus detalles
      </div>
    );
  }

  const { user } = useAuth();
  const canEdit = userHasPermission(user!, "productos_elaborados", "edit");
  const canDelete = userHasPermission(user!, "productos_elaborados", "delete");

  const handleViewLote = (lote: LotesProductosFinales) => {
    setSelectedLote(lote);
    setViewMode("loteDetails");
  };

  const handleBackToDetails = () => {
    setViewMode("details");
    setSelectedLote(null);
  };

  const handleOnCloseDetails = () => {
    setProductoId(null);
    setShowProductoDetalles(false);
    setSelectedLote(null);
    setViewMode("details");
  };

  const handleOnCloseLoteDetails = () => {
    setSelectedLote(null);
    setViewMode("details");
  };

  const handleEditProducto = () => {
    setShowProductoForm(true);
    setShowProductoDetalles(false);
    setUpdateProducto(true)
  }

  const handleDeleteProducto = async () => {
    await deleteProducto(producto.id)
    setShowDeleteModal(false)
    handleOnCloseDetails()
  }

  // Lote Details View
  if (viewMode === "loteDetails" && selectedLote) {
    return (
      <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background`}>
        <ProductosFinalesLoteDetails
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
    <div className={`w-full bg-background flex flex-col font-[Roboto]`}>
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProducto}
        isPending={isDeleting}
        title={`Eliminar ${producto.nombre_producto}`}
        description="¿Estás seguro que deseas eliminar este producto final? Se eliminarán también todos los lotes asociados."
      />
      {/* Header */}

      <div className="flex items-center justify-between p-6 pt-0 border-b ">
        <div className="flex items-center gap-4 max-w-4xl mx-auto w-full">
          <Button variant="ghost" size="icon" onClick={handleOnCloseDetails}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex justify-between w-full">
            <div>
              <h2 className="text-xl font-semibold">{producto.nombre_producto}</h2>
              <p className="text-sm text-muted-foreground">
                {producto.categoria_producto.nombre_categoria}
              </p>

            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="lg" onClick={handleEditProducto}>
                    <Edit className="h-4 w-4" /> Editar
                  </Button>
                </div>
              )}
            {canDelete && (
              <div className="flex items-center gap-2">
                <Button variant="destructive" size="lg" onClick={() => setShowDeleteModal(true)}>
                  <X className="h-5 w-5" /> Eliminar
                </Button>
              </div>
            )}
            </div>
          </div>
        </div>
        
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
                <p className="font-medium">{producto.unidad_produccion_producto.nombre_completo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Unidad Venta</p>
                <p className="font-medium">{producto.unidad_venta_producto?.nombre_completo || "-"}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">{producto.descripcion || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fecha Creación</p>
                <p className="font-medium">{producto.fecha_creacion_registro}</p>
              </div>
              {producto.receta_relacionada && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Receta</p>
                  <Button variant="link" onClick={() => setShowRecipeModal(true)}>
                    {producto.receta_relacionada.nombre}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Variantes Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Variantes ({producto.variantes.length})
            </h3>
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                        <tr>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3 font-medium">Precio (Divisa)</th>
                            <th className="px-4 py-3 font-medium">Precio (Local)</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-right">Punto Reorden</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {producto.variantes.map((variante) => (
                            <tr key={variante.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium">
                                    {variante.nombre_variante}
                                    {variante.SKU && <p className="text-[10px] text-muted-foreground">SKU: {variante.SKU}</p>}
                                </td>
                                <td className="px-4 py-3">${variante.precio_venta_divisa}</td>
                                <td className="px-4 py-3">${variante.precio_venta_local}</td>
                                <td className={`px-4 py-3 text-right font-medium ${variante.stock_actual <= variante.punto_reorden ? "text-destructive" : ""}`}>
                                    {variante.stock_actual}
                                </td>
                                <td className="px-4 py-3 text-right text-muted-foreground">{variante.punto_reorden}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>

          <Separator />

          {/* Lotes Table */}
          <LotesProductosFinalesTable
            productoId={producto.id}
            onViewLote={handleViewLote}
          />
        </div>
        {producto.receta_relacionada && (
          <RecipeModal
            isOpen={showRecipeModal}
            onClose={() => setShowRecipeModal(false)}
            data={recipeDetails}
            isLoading={isLoadingRecipe}
          />
        )}
      </ScrollArea>
    </div>
  );
};
