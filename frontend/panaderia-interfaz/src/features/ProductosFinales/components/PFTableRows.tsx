import type { ProductoFinal } from "../types/types";
import { PFTablerow } from "./PFTablerow";

export const PFTableRows = ({ data }: { data: ProductoFinal[] }) => {
  const sortedData = [...data].sort((a, b) => a.id - b.id);
  return (
    <>
      {sortedData.map((item, index) => (
        <PFTablerow item={item} index={index} key={item.id} />
      ))}
    </>
  );
};
