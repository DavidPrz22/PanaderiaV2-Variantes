import { ProductionComponentItem } from "./ProductionComponentItem";
import type { subreceta } from "../types/types";
import type { watchSetvalueTypeProduction } from "../types/types";
// import { useComponentsProductionQuery } from "../hooks/queries/ProductionQueries";

export const ProductionSubComponents = ({
  subreceta,
  setValue,
  watch,
}: { subreceta: subreceta } & watchSetvalueTypeProduction) => {
  // const {
  //     data: productionComponentes = [],
  //     isFetched,
  //   } = useComponentsProductionQuery();

  // const recetasProduct = "subrecetas" in productionComponentes ? productionComponentes.subrecetas : [];

  return (
    <div className="bg-blue-50/30">
      <div className="p-4 border border-gray-200 rounded-t-lg bg-blue-50/50 ">
        <div className="font-[Roboto]">
          <div className="flex items-center space-x-2">
            <div className="font-semibold text-xl text-blue-900">
              {subreceta.nombre}
            </div>
            <div className="border border-blue-200 rounded-md text-blue-700 p-0.5 text-xs">
              receta relacionada
            </div>
          </div>
          <span className="text-blue-800 text-md ">
            Componentes de la receta
          </span>
        </div>
      </div>
      <div className="p-4 border border-gray-200 border-t-0 rounded-b-lg">
        <div className="font-semibold text-lg text-gray-700">Componentes:</div>
        <div className="space-y-2 mt-4">
          {subreceta.componentes.map((componente) => (
            <ProductionComponentItem
              key={componente.componente_id}
              componente_id={componente.componente_id}
              titulo={componente.nombre}
              stock={componente.stock}
              unidad={componente.unidad_medida}
              cantidad={componente.cantidad}
              setValue={setValue}
              watch={watch}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
