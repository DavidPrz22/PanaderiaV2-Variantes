import type { watchSetvalueTypeProduction } from "../types/types";
import { ProductionComponentItemCantidad } from "./ProductionComponentItemCantidad";
import { useProductionContext } from "@/context/ProductionContext";
import { Xmark } from "@/assets/GeneralIcons/Xmark";

type itemProps = {
  componente_id: number;
  titulo: string;
  stock: number;
  unidad: string;
  cantidad: number;
  tipo?: "MateriaPrima" | "ProductoIntermedio";
  isAdditional?: boolean;
};

export const ProductionComponentItem = ({
  componente_id,
  titulo,
  stock,
  unidad,
  cantidad,
  tipo,
  isAdditional,
  watch,
  setValue,
}: itemProps & watchSetvalueTypeProduction) => {
  const { componentesBaseProduccion, setComponentesBaseProduccion } = useProductionContext();

  const handleRemoveComponent = () => {
    // Remove from base components
    const updatedComponents = componentesBaseProduccion.filter(comp => comp.componente_id !== componente_id);
    setComponentesBaseProduccion(updatedComponents);

    // Remove from form components
    const currentComponentes = watch && watch("componentes") || [];
    const filteredComponents = currentComponentes.filter(comp => comp.componente_id !== componente_id);
    setValue?.("componentes", filteredComponents, { shouldValidate: true });
  };

  return (
    <div className={`relative flex lg:flex-row flex-col lg:items-center justify-between px-10 py-3 border rounded-lg gap-2 bg-white font-[Roboto] ${
      isAdditional ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
    }`}>
      {isAdditional && (
        <button
          onClick={handleRemoveComponent}
          className="cursor-pointer absolute top-[50%] translate-y-[-50%] right-2  hover:text-red-700 text-red-500 rounded-full transition-colors duration-200 flex items-center justify-center text-sm font-bold z-10"
          title="Remover componente adicional"
        >
          <Xmark />
        </button>
      )}
      
      <div className="space-y-1">
        <h2 className="flex gap-2 text-lg font-semibold items-center">
          {titulo}
          <span className="bg-gray-200 text-sm px-2 py-0.5 rounded-sm font-semibold">
            {unidad}
          </span>
          {isAdditional && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Adicional
            </span>
          )}
          {tipo && (
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              tipo === 'MateriaPrima'
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {tipo === 'MateriaPrima' ? 'Materia Prima' : 'Producto Intermedio'}
            </span>
          )}
        </h2>
        <p className="text-gray-600 text-md">
          Stock disponible: {stock} {unidad}
        </p>
      </div>

      <ProductionComponentItemCantidad
        componente_id={componente_id}
        stock={stock}
        unidad={unidad}
        cantidad={cantidad}
        nombre={titulo}
        setValue={setValue}
        watch={watch}
      />
    </div>
  );
};
