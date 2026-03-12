import type { PFFormSelectContainerProps, watchSetValueProps } from "../types/types";
import { get } from "react-hook-form";

export const PFFormSelectContainer = ({
  title,
  name,
  register,
  errors,
  children,
  optional,
  setValue,
}: PFFormSelectContainerProps & watchSetValueProps) => {

  const getMedidaFisicaFromUnidad  = (
    unidad: string
  ) : "UNIDAD" | "PESO" | "VOLUMEN" => {

    const nombre = unidad.toUpperCase();
    if (nombre.includes("GRAMO") || nombre.includes("KILOGRAMO") || nombre.includes("MILIGRAMO")) {
      return "PESO";
    }
    if (nombre.includes("LITRO") || nombre.includes("MILILITRO")) {
      return "VOLUMEN";
    }
    return "UNIDAD";
};
  const { onChange, ...rest } = register(name);

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    onChange(e);

    if (name === "unidad_venta") {
      if (setValue === undefined) return;
      const selectedOption = e.target.selectedOptions[0];
      const medida =  selectedOption.text
      console.log(medida)
      const tipo_medida_fisica = getMedidaFisicaFromUnidad(medida);
      setValue("tipo_medida_fisica", tipo_medida_fisica);

      if (tipo_medida_fisica === "UNIDAD") {
        setValue("vendible_por_medida_real", false);
      } else {
        setValue("vendible_por_medida_real", true);
      }

    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div
          className={`basis-1/4 font-[Roboto] text-sm font-semibold ${optional ? "text-black" : "text-red-500"}`}
        >
          {title}
        </div>
        <select
          {...rest}
          onChange={handleOnChange}
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
