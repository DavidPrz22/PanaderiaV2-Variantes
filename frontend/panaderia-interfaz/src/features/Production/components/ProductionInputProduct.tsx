import { SearchIconDark } from "@/assets/DashboardAssets";
import { ProductSearchContainer } from "./ProductionSearchContainer";
import { useProductSearchQueries } from "../hooks/queries/ProductionQueries";
import { useProductionContext } from "@/context/ProductionContext";
import { useState } from "react";
import ProductionXicon from "./ProductionXicon";
import type { watchSetvalueTypeProduction } from "../types/types";

export const ProductionInputProduct = ({
  title,
  setValue,
}: { title: string } & watchSetvalueTypeProduction) => {
  const [{ data: finalesData }, { data: intermediosData }] = useProductSearchQueries();
  const finales = finalesData?.productos;
  const intermedios = intermediosData?.productos;

  const {
    productSearchRef,
    productType,
    isFocused,
    setIsFocused,
    setSearchQuery,
    setShowSearch,
  } = useProductionContext();

  const showFinalesSearch =
    finales && productType === "producto-final" && isFocused;
  const showIntermediosSearch =
    intermedios && productType === "producto-intermedio" && isFocused;

  const [selected, setSelected] = useState<boolean>(false);

  const handleClear = () => {
    productSearchRef.current!.value = "";
    setSelected(false);
    setSearchQuery("");
  };

  const handleFocus = () => {
    if (productType) {
      setIsFocused(true);
    }
  };

  const handleOnSelection = (id: number) => {
    if (setValue) setValue("producto_variante_id", id);
    setSelected(true);
  };

  return (
    <div className="flex flex-1 flex-col gap-2 w-full relative">
      <div className="font-semibold font-[Roboto]">{title}</div>
      <div className="flex gap-2 relative">
        <div className="absolute top-4.5 left-4">
          <img src={SearchIconDark} className="size-5" alt="Buscar" />
        </div>
        <div className="w-full relative">
          <input
            type="text"
            className="pl-11 pr-2 py-[0.95rem] w-full outline-none border border-gray-300 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-[box-shadow] duration-300"
            placeholder="Busca un producto..."
            ref={productSearchRef}
            onFocus={handleFocus}
            onBlur={() => {
              setTimeout(() => setShowSearch(false), 100); // hacer que el click se detecte
              setTimeout(() => setIsFocused(false), 300); // hacer que el click se detecte y mostrar animacion
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={selected}
          />
          {selected && <ProductionXicon onClick={handleClear} />}
        </div>
      </div>

      {showFinalesSearch && (
        <ProductSearchContainer
          data={finales}
          onSelection={handleOnSelection}
        />
      )}
      {showIntermediosSearch && (
        <ProductSearchContainer
          data={intermedios}
          onSelection={handleOnSelection}
        />
      )}
    </div>
  );
};
