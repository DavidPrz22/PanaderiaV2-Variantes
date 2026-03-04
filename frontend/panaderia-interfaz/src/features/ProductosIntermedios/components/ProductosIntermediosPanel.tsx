import FilterSearch from "./FilterSearch";
import ProductosIntermediosLista from "./ProductosIntermediosLista";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";

export default function ProductosIntermediosPanel() {
  const {
    showProductosIntermediosForm,
    showProductosIntermediosDetalles,
  } = useProductosIntermediosContext();

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
