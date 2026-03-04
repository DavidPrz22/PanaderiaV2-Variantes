import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import ProductosIntermediosFormShared from "./ProductosIntermediosFormShared";

export default function ProductosIntermediosForma() {
  const { showProductosIntermediosForm, setShowProductosIntermediosForm } =
    useProductosIntermediosContext();

  const handleSuccessClose = () => {
    setShowProductosIntermediosForm(false);
  };

  if (!showProductosIntermediosForm) return <></>;

  return (
    <ProductosIntermediosFormShared
      title="Nuevo Producto Intermedio"
      onClose={handleSuccessClose}
      onSubmitSuccess={handleSuccessClose}
    />
  );
}
