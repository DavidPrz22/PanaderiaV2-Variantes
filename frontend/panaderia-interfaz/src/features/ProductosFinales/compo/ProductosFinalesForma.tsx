import ProductosFinalesFormShared from "@/features/ProductosFinales/components/ProductosFinalesFormShared";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";

export default function ProductosFinalesForma() {
  const { showProductoForm, setShowProductoForm } =
    useProductosFinalesContext();

  const handleSuccessClose = () => {
    setShowProductoForm(false);
  };

  if (!showProductoForm) return <></>;

  return (
    <ProductosFinalesFormShared
      title="Nuevo Producto Final"
      onClose={handleSuccessClose}
      onSubmitSuccess={handleSuccessClose}
    />
  );
}
