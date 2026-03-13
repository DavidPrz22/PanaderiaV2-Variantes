import { DeleteComponent } from "./DeleteComponent";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import ProductosReventaFormShared from "./ProductosReventaFormShared";
import { TitleDetails } from "@/components/TitleDetails";
import { DetailsTable } from "./DetailsTable";
import { useGetProductosReventaDetalles } from "../hooks/queries/queries";
import { useEffect } from "react";
import { useDeleteProductosReventaMutation } from "../hooks/mutations/productosReventaMutations";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
import { DetallesHeader } from "@/components/DetallesHeader";
import Title from "@/components/Title";
import { LotesProductosReventaTable } from "./LotesProductosReventaTable";
import { PRLotesDetailsContainer } from "./PRLotesDetailsContainer";
import { PRLotesFormShared } from "./PRLotesFormShared";
import Button from "@/components/Button";
import { PlusCircle } from "@/assets/GeneralIcons/Index";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";

export default function ProductosReventaDetalles() {
  const {
    showProductosReventaDetalles,
    updateRegistro,
    setUpdateRegistro,
    setRegistroDelete,
    setShowProductosReventaDetalles,
    registroDelete,
    productoReventaId,
    enabledDetalles,
    setEnabledDetalles,
    showPRLotesDetalles,
    showPRLotesForm,
    setShowPRLotesForm,
  } = useProductosReventaContext();

  const {
    data: productosReventaDetalles,
    isFetching: isFetchingDetalles,
    isSuccess: isSuccessDetalles,
  } = useGetProductosReventaDetalles(productoReventaId!);

  const {
    mutateAsync: deleteProductosReventa,
    isPending: isPendingDeleteProductosReventa,
  } = useDeleteProductosReventaMutation();

  const { user } = useAuth();
  const userCanEdit = userHasPermission(user!, 'productos_reventa', 'edit');
  const userCanDelete = userHasPermission(user!, 'productos_reventa', 'delete');
  const userCanAddLot = userHasPermission(user!, 'lots', 'add');

  useEffect(() => {
    if (isSuccessDetalles && productosReventaDetalles && enabledDetalles) {
      setShowProductosReventaDetalles(true);
      setEnabledDetalles(false);
    }
  }, [
    productoReventaId,
    productosReventaDetalles,
    isSuccessDetalles,
    enabledDetalles,
    setShowProductosReventaDetalles,
    setEnabledDetalles,
  ]);


  if (!showProductosReventaDetalles) return <></>;

  const handleCloseUpdate = () => {
    setShowProductosReventaDetalles(false);
    setUpdateRegistro(false);
  };

  const handleClose = () => {
    setShowProductosReventaDetalles(false);
  };

  if (updateRegistro) {
    return (
      <ProductosReventaFormShared
        title="Editar Producto de Reventa"
        isUpdate={true}
        onClose={handleCloseUpdate}
        onSubmitSuccess={handleCloseUpdate}
        initialData={productosReventaDetalles!}
      />
    );
  }

  const handleDelete = async () => {
    await deleteProductosReventa(productoReventaId!);
    setShowProductosReventaDetalles(false);
    setRegistroDelete(false);
  };

  if (showPRLotesForm) {
    return (
      <PRLotesFormShared
        title="Nuevo Lote"
        onClose={() => setShowPRLotesForm(false)}
        onSubmitSuccess={() => setShowPRLotesForm(false)}
      />
    );
  }

  if (showPRLotesDetalles) {
    return <PRLotesDetailsContainer />;
  }

  return (
    <div className="flex flex-col gap-5 mx-8 border border-gray-200 p-5 rounded-lg shadow-md h-full relative">
      <DetallesHeader
        title={productosReventaDetalles?.nombre_producto}
        onEdit={userCanEdit ? () => setUpdateRegistro(true) : undefined}
        onDelete={userCanDelete ? () => setRegistroDelete(true) : undefined}
        onClose={handleClose}
      />

      {registroDelete && productoReventaId !== null && (
        <DeleteComponent
          deleteFunction={handleDelete}
          cancelFunction={() => setRegistroDelete(false)}
          isLoading={isPendingDeleteProductosReventa}
          title="Eliminar Producto de Reventa"
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
          productosReventaDetalles={productosReventaDetalles!}
        />
      </div>

      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <Title extraClass="text-blue-600">Lotes de producto de reventa</Title>
          {userCanAddLot && (
            <Button type="add" onClick={() => setShowPRLotesForm(true)}>
              <div className="flex items-center gap-2">
                Agregar Lote <PlusCircle className="inline-block ml-2" />
              </div>
            </Button>
          )}
        </div>
        <LotesProductosReventaTable />
      </div>
    </div>
  );
}
