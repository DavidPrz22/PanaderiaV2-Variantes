import { DeleteComponent } from "./DeleteComponent";
import { ProductosReventaVariantesTable } from "./ProductosReventaVariantesTable";

import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { TitleDetails } from "@/components/TitleDetails";
import { DetailsTable } from "./DetailsTable";
import { useGetProductosReventaDetalles } from "../hooks/queries/queries";
import { useEffect } from "react";
import { useDeleteProductosReventaMutation } from "../hooks/mutations/productosReventaMutations";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
import { DetallesHeader } from "@/components/DetallesHeader";
import Title from "@/components/Title";
import { ProductosReventaLotesTable } from "./lotes/ProductosReventaLotesTable";
import { ProductosReventaLoteDetailsContainer } from "./lotes/ProductosReventaLoteDetailsContainer";
import { ProductosReventaLoteForm } from "./lotes/ProductosReventaLoteForm";
import Button from "@/components/Button";
import { PlusCircle } from "@/assets/GeneralIcons/Index";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";

export default function ProductosReventaDetalles() {
  const {
    showProductosReventaDetalles,
    setUpdateRegistro,
    setRegistroDelete,
    setShowProductosReventaDetalles,
    setShowProductosReventaForm,
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

  const handleClose = () => {
    setShowProductosReventaDetalles(false);
  };


  const handleDelete = async () => {
    await deleteProductosReventa(productoReventaId!);
    handleClose();
    setRegistroDelete(false);
  };

  if (showPRLotesForm) {
    return (
      <ProductosReventaLoteForm
        title="Nuevo Lote"
        onClose={() => setShowPRLotesForm(false)}
      />
    );
  }

  if (showPRLotesDetalles) {
    return <ProductosReventaLoteDetailsContainer />;
  }

  return (
    <div className="flex flex-col gap-5 rounded-lg relative ">
      <DetallesHeader
        title={productosReventaDetalles?.nombre_producto}
        onEdit={userCanEdit ? () => {
          setUpdateRegistro(true);
          setShowProductosReventaForm(true);
          handleClose()
        } : undefined}
        onDelete={userCanDelete ? () => setRegistroDelete(true) : undefined}
        onClose={handleClose}
      >

      </DetallesHeader>
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
      
      <div className="w-4xl max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <DetailsTable
            productosReventaDetalles={productosReventaDetalles!}
          />
        </div>

        <div className="space-y-4 mt-4">
          <Title extraClass="text-blue-600">Variantes ({productosReventaDetalles?.variantes.length})</Title>
          <ProductosReventaVariantesTable variantes={productosReventaDetalles?.variantes || []} />
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
          <ProductosReventaLotesTable />
        </div>
      </div>
      
    </div>
  );
}
