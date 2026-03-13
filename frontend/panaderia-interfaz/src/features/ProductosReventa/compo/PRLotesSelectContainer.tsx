import type { PRLotesFormSelectContainerProps } from "../types/types";
import { get } from "react-hook-form";

export const PRLotesSelectContainer = ({
  title,
  name,
  register,
  errors,
  children,
  optional,
}: PRLotesFormSelectContainerProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div
          className={`basis-1/4 font-[Roboto] text-sm font-semibold ${optional ? "text-black" : "text-red-500"}`}
        >
          {title}
        </div>
        <select
          {...register(name)}
          className="basis-2/4 border border-gray-300 rounded-md p-2 cursor-pointer"
        >
          {children}
        </select>
      </div>
      <div className="ml-[27%] text-red-500 text-xs">
        {get(errors, name)?.message}
      </div>
    </div>
  );
};