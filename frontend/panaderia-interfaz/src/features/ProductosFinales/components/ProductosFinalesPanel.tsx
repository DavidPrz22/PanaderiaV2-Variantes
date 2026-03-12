import FilterSearch from "./FilterSearch";
import ProductosFinalesLista from "./ProductosFinalesLista";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";
import { useProductoFinalDetalles } from "../hooks/queries/queries";
import { useEffect } from "react";

export default function ProductosFinalesPanel() {
  const {
    showProductoForm,
    showProductoDetalles,
    productoId,
    setShowProductoDetalles
  } = useProductosFinalesContext();

  const { data: producto } = useProductoFinalDetalles(productoId!);

  useEffect(() => {
    if (productoId && producto) {
      setShowProductoDetalles(true);
    }
  }, [producto, productoId, setShowProductoDetalles]);
  
  if (showProductoForm || showProductoDetalles)
    return <></>;

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        <FilterSearch />
        <ProductosFinalesLista />
      </div>
    </>
  );
}
