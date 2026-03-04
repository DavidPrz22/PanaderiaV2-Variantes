import FilterSearch from "./FilterSearch";
import ProductosIntermediosLista from "./ProductosIntermediosLista";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { useGetParametros } from "../hooks/queries/queries";
import { useEffect } from "react";
import type {
  CategoriaProductoIntermedio,
  UnidadesDeMedida,
} from "../types/types";

export default function ProductosIntermediosPanel() {
  const {
    showProductosIntermediosForm,
    showProductosIntermediosDetalles,
    setUnidadesMedida,
    setCategoriasProductoIntermedio,
  } = useProductosIntermediosContext();

  const [{ data: unidadesMedida }, { data: categoriasProductoIntermedio }] =
    useGetParametros();
  useEffect(() => {
    if (unidadesMedida && categoriasProductoIntermedio) {
      setUnidadesMedida(unidadesMedida as UnidadesDeMedida[]);
      setCategoriasProductoIntermedio(
        categoriasProductoIntermedio as CategoriaProductoIntermedio[],
      );
    }
  }, [unidadesMedida, categoriasProductoIntermedio]);

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
