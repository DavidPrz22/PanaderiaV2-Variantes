import FilterSearch from "./FilterSearch";
import ProductosIntermediosLista from "./ProductosIntermediosLista";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { useGetProductosIntermediosDetalles } from "../hooks/queries/queries";
import { useEffect } from "react";
export default function ProductosIntermediosPanel() {
  const {
    showProductosIntermediosForm,
    showProductosIntermediosDetalles,
    productoIntermedioId,
    setShowProductosIntermediosDetalles
  } = useProductosIntermediosContext();
  const { data: productoIntermedio } = useGetProductosIntermediosDetalles(productoIntermedioId!);
  useEffect(() => {
    if (productoIntermedioId && productoIntermedio) {
      setShowProductosIntermediosDetalles(true);
    }
  }, [productoIntermedio, productoIntermedioId]);
  
  if (showProductosIntermediosForm || showProductosIntermediosDetalles)
    return <></>;

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        <FilterSearch />
        <ProductosIntermediosLista />
      </div>
    </>
  );
}
