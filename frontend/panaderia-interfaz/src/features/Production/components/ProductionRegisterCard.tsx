import { ProductionTypeContainer } from "./ProductionTypeContainer";
import { ProductionRegisterCardTitle } from "./ProductionRegisterCardTitle";
import { ProductDateInput } from "./ProductDateInput";
import { ProductionCantidad } from "./ProductionCantidad";
import { useState } from "react";
import type { watchSetvalueTypeProduction } from "../types/types";
import { ProductionUnitInfo } from "./ProductionUnitInfo";
import { useProductionContext } from "@/context/ProductionContext";
import { useEffect } from "react";
import { ProductSelectorModalTrigger } from "./ProductSelectorModalTrigger";

export const ProductionRegisterCard = ({
  watch,
  setValue,
}: watchSetvalueTypeProduction) => {

  const { esPorUnidad, medidaFisica, selectedProduct, productType } = useProductionContext();

  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (esPorUnidad && medidaFisica === 'UNIDAD') {
      if (setValue) setValue("peso", undefined);
      if (setValue) setValue("volumen", undefined);
    }
  }, [esPorUnidad, medidaFisica, setValue]);

  const handleSetOpenModal = (open: boolean) => {
    if (!productType) return;
    setOpenModal(open);
  }
  return (
    <div className="flex flex-col gap-5 p-8 bg-white rounded-lg shadow-md border border-gray-200 font-[Roboto]">
      <ProductionRegisterCardTitle />
      <ProductionTypeContainer setValue={setValue} />

      <div className="flex lg:flex-row flex-col items-center gap-2 ">
        <ProductSelectorModalTrigger
          openModal={openModal}
          setOpenModal={handleSetOpenModal}
          selectedProduct={selectedProduct!}
          setValue={setValue}

        />

        <ProductionCantidad setValue={setValue} watch={watch} />
        <div className="flex flex-1 flex-col gap-2 w-full">
          <div className="font-semibold font-[Roboto]">
            Fecha de Vencimiento
          </div>
          <ProductDateInput setValue={setValue} />
        </div>
      </div>
      {esPorUnidad && medidaFisica !== 'UNIDAD' && (
        <ProductionUnitInfo setValue={setValue} />
      )}
    </div>
  );
};
