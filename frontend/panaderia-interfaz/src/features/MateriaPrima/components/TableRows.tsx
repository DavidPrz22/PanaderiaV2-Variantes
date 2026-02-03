import { TableRow } from "./Tablerow";

import type { MateriaPrimaList } from "@/features/MateriaPrima/types/types";

export const TableRows = ({ data }: { data: MateriaPrimaList[] }) => {
  return (
    <>
      {data.map((item, index) => (
        <TableRow item={item} index={index} key={item.id} last={index === data.length - 1}/>
      ))}
    </>
  );
};
