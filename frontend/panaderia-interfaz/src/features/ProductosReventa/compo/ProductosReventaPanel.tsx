import FilterSearch from "./FilterSearch";
import ProductosReventaLista from "./ProductosReventaLista";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { useGetParametros } from "../hooks/queries/queries";
import { useEffect } from "react";
import type {
  CategoriaProductosReventa,
  Proveedor,
  UnidadesDeMedida,
} from "../types/types";

export default function ProductosReventaPanel() {
  const {
    showProductosReventaForm,
    showProductosReventaDetalles,
    setUnidadesMedida,
    setCategoriasProductosReventa,
    setProveedores,
  } = useProductosReventaContext();

  const [
    { data: unidadesMedida },
    { data: categoriasProductosReventa },
    { data: proveedores }
  ] = useGetParametros();

  useEffect(() => {
    if (unidadesMedida) {
      setUnidadesMedida(unidadesMedida as UnidadesDeMedida[]);
    }
    if (categoriasProductosReventa) {
      setCategoriasProductosReventa(
        categoriasProductosReventa as CategoriaProductosReventa[],
      );
    }
    if (proveedores) {
      setProveedores(proveedores as Proveedor[]);
    }
  }, [unidadesMedida, categoriasProductosReventa, proveedores]);

  if (showProductosReventaForm || showProductosReventaDetalles) return <></>;

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        <FilterSearch />
        <ProductosReventaLista />
      </div>
    </>
  );
}