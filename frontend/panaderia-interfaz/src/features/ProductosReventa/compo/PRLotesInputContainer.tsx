import type { PRLotesFormInputContainerProps } from "../types/types";
import PRLotesInputForm from "./PRLotesInputForm";
import { get } from "react-hook-form";

export const PRLotesInputContainer = ({
  inputType,
  title,
  name,
  register,
  errors,
  optional,
}: PRLotesFormInputContainerProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div
          className={`basis-1/4 font-[Roboto] text-sm font-semibold ${optional ? "text-black" : "text-red-500"}`}
        >
          {title}
        </div>
        <div className="basis-2/4">
          <PRLotesInputForm
            typeInput={inputType}
            name={name}
            register={register}
          />
        </div>
      </div>
      <div className="ml-[27%] text-red-500 text-xs">
        {get(errors, name)?.message}
      </div>
    </div>
  );
};