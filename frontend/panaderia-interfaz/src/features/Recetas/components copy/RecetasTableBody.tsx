import { RecetasTablerows } from "./RecetasTablerows";
import type { recetaItem } from "../types/types";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
import { NoDataMessage } from "./NoDataMessage";

export const RecetasTableBody = ({
  data,
  isFetching,
}: {
  data: recetaItem[];
  isFetching: boolean;
}) => {
  return (
    <>
      {isFetching ? (
        <PendingTubeSpinner
          size={28}
          extraClass="absolute bg-white opacity-50 h-[80%] w-full"
        />
      ) : data.length > 0 ? (
        <RecetasTablerows data={data} />
      ) : (
        <NoDataMessage />
      )}
    </>
  );
};
