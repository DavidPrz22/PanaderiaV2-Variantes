import { get } from "react-hook-form";
import RecetasInput from "./RecetasInput";
import type { RecetasFormInputContainerProps } from "../types/types";
import RecetasSearchInput from "./RecetaSearchInput";
import RecetaListSearchInput from "./RecetaListSearchInput";

export default function RecetasFormInputContainer({
  register,
  title,
  name,
  errors,
  inputType,
  componenteBusqueda,
  recetaBusqueda,
  optional,
  onChange,
  placeholder,
}: RecetasFormInputContainerProps) {
  function handleRecetaBusqueda() {
    let inputElement;
    if (recetaBusqueda) {
      inputElement = (
        <RecetaListSearchInput
          typeInput={inputType}
          placeholder={placeholder}
          onChange={onChange}
        />
      );
    } else if (componenteBusqueda) {
      inputElement = (
        <RecetasSearchInput
          typeInput={inputType}
          placeholder={placeholder}
          onChange={onChange}
        />
      );
    } else {
      inputElement = (
        <RecetasInput register={register} name={name} typeInput={inputType} />
      );
    }
    return inputElement;
  }

  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex flex-col gap-2">
        <div
          className={`font-[Roboto] text-md font-semibold ${optional ? "text-black" : "text-red-500"}`}
        >
          {title}
        </div>
        {handleRecetaBusqueda()}
      </div>

      <div className="pl-1 text-red-500 text-xs">
        {get(errors, name)?.message}
      </div>
    </div>
  );
}
