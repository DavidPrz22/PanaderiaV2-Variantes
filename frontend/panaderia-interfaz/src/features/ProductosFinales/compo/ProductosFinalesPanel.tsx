import FilterSearch from "./FilterSearch";
import ProductosFinalesLista from "./ProductosFinalesLista";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";
import { useGetParametros } from "../hooks/queries/queries";
import { useEffect } from "react";
import type { CategoriaProductoFinal, UnidadesDeMedida } from "../types/types";

export default function ProductosFinalesPanel() {
  const {
    showProductoForm,
    showProductoDetalles,
    setUnidadesMedida,
    setCategoriasProductoFinal,
  } = useProductosFinalesContext();

  const [{ data: unidadesMedida }, { data: categoriasProductoFinal }] =
    useGetParametros();
  useEffect(() => {
    if (unidadesMedida && categoriasProductoFinal) {
      setUnidadesMedida(unidadesMedida as UnidadesDeMedida[]);
      setCategoriasProductoFinal(
        categoriasProductoFinal as CategoriaProductoFinal[],
      );
    }
  }, [unidadesMedida, categoriasProductoFinal]);

  if (showProductoForm || showProductoDetalles) return <></>;

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        <FilterSearch />
        <ProductosFinalesLista />
      </div>
    </>
  );
}
