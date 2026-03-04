import { DeleteComponent } from "./DeleteComponent";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import ProductosIntermediosFormShared from "./ProductosIntermediosFormShared";
import { TitleDetails } from "@/components/TitleDetails";
import { DetailsTable } from "./DetailsTable";
import { useGetProductosIntermediosDetalles } from "../hooks/queries/queries";
import { useEffect } from "react";
import { useDeleteProductoIntermedioMutation } from "../hooks/mutations/productosIntermediosMutations";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
import { DetallesHeader } from "@/components/DetallesHeader";
import { LotesProductosIntermediosTable } from "./LotesProductosIntermediosTable";
import { PILotesDetailsContainer } from "./PILotesDetailsContainer";
import Title from "@/components/Title";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";
import { RecipeModal } from "@/components/RecipeModal";
import { useQuery } from "@tanstack/react-query";
import { recetasDetallesQueryOptions } from "@/features/Recetas/hooks/queries/RecetasQueryOptions";

export default function ProductosIntermediosDetalles() {
  const {
    showProductosIntermediosDetalles,
    updateRegistro,
    setUpdateRegistro,
    setRegistroDelete,
    setShowProductosIntermediosDetalles,
    registroDelete,
    productoIntermedioId,
    setIsLoadingDetalles,
    enabledDetalles,
    setEnabledDetalles,
    showLotesDetalles,
    showRecipeModal,
    setShowRecipeModal,
    selectedRecipeId,
  } = useProductosIntermediosContext();

  const {
    data: productoIntermediosDetalles,
    isFetching: isFetchingDetalles,
    isSuccess: isSuccessDetalles,
  } = useGetProductosIntermediosDetalles(productoIntermedioId!);

  const {
    mutateAsync: deleteProductoIntermedio,
    isPending: isPendingDeleteProductoIntermedio,
  } = useDeleteProductoIntermedioMutation();

  const { data: recipeDetails, isLoading: isLoadingRecipe } = useQuery({
    ...recetasDetallesQueryOptions(selectedRecipeId!),
    enabled: !!selectedRecipeId && showRecipeModal,
  });

  const { user } = useAuth();
  const userCanEdit = userHasPermission(user!, 'productos_elaborados', 'edit');
  const userCanDelete = userHasPermission(user!, 'productos_elaborados', 'delete');

  useEffect(() => {
    if (isSuccessDetalles && productoIntermediosDetalles && enabledDetalles) {
      setShowProductosIntermediosDetalles(true);
      setEnabledDetalles(false);
    }
  }, [
    productoIntermedioId,
    productoIntermediosDetalles,
    isSuccessDetalles,
    enabledDetalles,
    setIsLoadingDetalles,
    setShowProductosIntermediosDetalles,
    setEnabledDetalles,
  ]);

  useEffect(() => {
    setIsLoadingDetalles(isFetchingDetalles);
  }, [isFetchingDetalles, setIsLoadingDetalles]);

  if (!showProductosIntermediosDetalles) return <></>;

  const handleCloseUpdate = () => {
    setShowProductosIntermediosDetalles(false);
    setUpdateRegistro(false);
  };

  const handleClose = () => {
    setShowProductosIntermediosDetalles(false);
  };

  if (updateRegistro) {
    return (
      <ProductosIntermediosFormShared
        title="Editar Producto Intermedio"
        isUpdate={true}
        onClose={handleCloseUpdate}
        onSubmitSuccess={handleCloseUpdate}
        initialData={productoIntermediosDetalles!}
      />
    );
  }
  const handleDelete = async () => {
    await deleteProductoIntermedio(productoIntermedioId!);
    setShowProductosIntermediosDetalles(false);
    setRegistroDelete(false);
  };
  if (showLotesDetalles) {
    return <PILotesDetailsContainer />;
  }
  return (
    <div className="flex flex-col gap-5 mx-8 border border-gray-200 p-5 rounded-lg shadow-md h-full relative">
      <DetallesHeader
        title={productoIntermediosDetalles?.nombre_producto}
        onEdit={userCanEdit ? () => setUpdateRegistro(true) : undefined}
        onDelete={userCanDelete ? () => setRegistroDelete(true) : undefined}
        onClose={handleClose}
      />

      {registroDelete && productoIntermedioId !== null && (
        <DeleteComponent
          deleteFunction={handleDelete}
          cancelFunction={() => setRegistroDelete(false)}
          isLoading={isPendingDeleteProductoIntermedio}
          title="Eliminar Producto Intermedio"
          buttonText="Eliminar"
        />
      )}

      {isFetchingDetalles && (
        <PendingTubeSpinner
          size={28}
          extraClass="absolute bg-white opacity-50 w-full h-full"
        />
      )}
      <div className="flex flex-col gap-6">
        <TitleDetails>Detalles</TitleDetails>
        <DetailsTable
          productoIntermediosDetalles={productoIntermediosDetalles!}
        />
        <div className="space-y-4 mt-4">

          <Title extraClass="text-blue-600">Lotes de producto intermedio</Title>
          <LotesProductosIntermediosTable />
        </div>
      </div>

      <RecipeModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        data={recipeDetails}
        isLoading={isLoadingRecipe}
      />
    </div>
  );
}
