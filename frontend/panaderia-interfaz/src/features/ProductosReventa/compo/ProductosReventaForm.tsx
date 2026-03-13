import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import ProductosReventaFormShared from "./ProductosReventaFormShared";

export default function ProductosReventaForm() {
  const { showProductosReventaForm, setShowProductosReventaForm } =
    useProductosReventaContext();

  if (!showProductosReventaForm) return <></>;

  return (
    <ProductosReventaFormShared
      title="Crear Producto de Reventa"
      isUpdate={false}
      onClose={() => setShowProductosReventaForm(false)}
      onSubmitSuccess={() => setShowProductosReventaForm(false)}
    />
  );
}