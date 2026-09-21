import { RecetaTablerow } from "./RecetaTablerow";
import type { RecetaItem } from "../types/types";

export const RecetasTablerows = ({ data }: { data: RecetaItem[] }) => {
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
