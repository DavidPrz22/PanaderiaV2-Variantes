import type { ProductosReventa } from "../types/types";
import { PRTableRow } from "./PRTableRow";

export const PRTableRows = ({ data }: { data: ProductosReventa[] }) => {
  data = data.sort((a, b) => a.id - b.id);
  return (
    <>
      {data.map((item, index) => (
        <PRTableRow item={item} index={index} key={item.id} />
      ))}
    </>
  );
};