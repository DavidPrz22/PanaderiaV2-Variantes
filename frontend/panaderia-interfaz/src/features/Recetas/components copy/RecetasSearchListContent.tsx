import RecetaSearchListItem from "./RecetaSearchListItem";
import type {
  RecetasSearchListContentProps,
  watchSetValueProps,
} from "../types/types";

export const RecetasSearchListContent = ({
  category,
  items,
  watch,
  setValue,
}: RecetasSearchListContentProps & watchSetValueProps) => {
  return (
    <div className="flex flex-col">
      <div className="font-[Roboto] text-md font-semibold border-b border-gray-300 py-2 px-5 ">
        {category}
      </div>
      <ul className="flex flex-col">
        {items.map((item, index) => (
          <RecetaSearchListItem
            key={index}
            nombre={item.nombre}
            id={item.id}
            tipo={item.tipo}
            unidad_medida={item.unidad_medida}
            watch={watch}
            setValue={setValue}
          />
        ))}
      </ul>
    </div>
  );
};
