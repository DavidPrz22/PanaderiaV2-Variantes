import type { PRFormInputContainerProps } from "../types/types";
import PRInputForm from "./PRInputForm";
import { get } from "react-hook-form";

export const PRFormInputContainer = ({
  inputType,
  title,
  name,
  register,
  errors,
  optional,
}: PRFormInputContainerProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div
          className={`basis-1/4 font-[Roboto] text-sm font-semibold ${optional ? "text-black" : "text-red-500"}`}
        >
          {title}
        </div>
        <div className="basis-2/4">
          <PRInputForm
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