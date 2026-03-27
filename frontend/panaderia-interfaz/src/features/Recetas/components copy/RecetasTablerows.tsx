import { RecetaTablerow } from "./RecetaTablerow";
import type { recetaItem } from "../types/types";

export const RecetasTablerows = ({ data }: { data: recetaItem[] }) => {
  data = data.sort((a, b) => a.id - b.id);
  return (
    <>
      {data.map((item, index) => (
        <RecetaTablerow
          item={item}
          index={index}
          key={item.id}
          last={index === data.length - 1}
        />
      ))}
    </>
  );
};
