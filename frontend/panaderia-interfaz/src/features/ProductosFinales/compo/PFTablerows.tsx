import type { ProductosFinalesList } from "../types/types";
import { PFTableRow } from "./PFTablerow";

export const PFTableRows = ({ data }: { data: ProductosFinalesList }) => {
  return (
    <>
      {data.map((item, index) => (
        <PFTableRow item={item} index={index} key={item.id} />
      ))}
    </>
  );
};
