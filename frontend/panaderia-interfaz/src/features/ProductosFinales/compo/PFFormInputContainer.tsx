import type { PFFormInputContainerProps, setValueProps } from "../types/types";
import PFInputForm from "./PFInputForm.tsx";
import PFInputFormSearch from "./PFInputFormSearch.tsx";
import { get } from "react-hook-form";

export const PFFormInputContainer = ({
  inputType,
  title,
  name,
  register,
  errors,
  optional,
  search,
  setValue,
  initialData,
  disabled,
}: PFFormInputContainerProps & setValueProps & { disabled?: boolean }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div
          className={`basis-1/4 font-[Roboto] text-sm font-semibold ${optional ? "text-black" : "text-red-500"}`}
        >
          {title}
        </div>
        <div className="basis-2/4">
          {search ? (
            disabled ?
              <PFInputFormSearch setValue={setValue} initialData={initialData} turned_off={true} />
            : <PFInputFormSearch setValue={setValue} initialData={initialData} />
          ) : (
            <PFInputForm
              typeInput={inputType}
              name={name}
              register={register}
              disabled={disabled}
            />
          )}
        </div>
      </div>
      <div className="ml-[27%] text-red-500 text-xs">
        {get(errors, name)?.message}
      </div>
    </div>
  );
};
