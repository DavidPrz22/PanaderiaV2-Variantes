import ProductionSearchListItem from "./ProductionSearchListItem";
import { useProductionContext } from "@/context/ProductionContext";
import type { componentesSearchItem } from "../types/types";

export const ProductionSearchListContent = ({
  category,
  items,
}: {
  category: string;
  items: componentesSearchItem[];
}) => {
  const {
    componentesBaseProduccion,
    setNewComponentSelected,
    setComponentSearchList,
    setShowComponentSearch,
  } = useProductionContext();

  const handleClick = (item: componentesSearchItem) => {
    setShowComponentSearch(false);
    setComponentSearchList([]);

    const componente = componentesBaseProduccion.findIndex((c) => c.componente_id === item.componente_id);
    if (componente !== -1) {
      setNewComponentSelected({...item, cantidad: 0, invalid: true});
    } else {
      setNewComponentSelected({...item, cantidad: 0});
    }
  };
  return (
    <div className="flex flex-col">
      <div className="font-[Roboto] text-sm font-semibold border-b border-gray-300 py-2 px-5 ">
        {category}
      </div>
      <ul className="flex flex-col">
        {items.map((item, index) => (
          <ProductionSearchListItem
            key={index}
            nombre={item.nombre}
            tipo={item.tipo}
            stock={item.stock | 0}
            unidad_medida={item.unidad_medida}
            onClick={() => handleClick(item)}
          />
        ))}
      </ul>
    </div>
  );
};
