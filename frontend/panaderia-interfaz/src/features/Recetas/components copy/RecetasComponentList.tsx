import { XRedIcon } from "@/assets/DashboardAssets/";
import { useRecetasContext } from "@/context/RecetasContext";
import type {
  recetasComponentListProps,
  watchSetValueProps,
} from "../types/types";
import type React from "react";

export default function RecetasComponentList({
  nombre,
  type,
  unidad_medida,
  id,
  cantidad,
  last,
  watch,
  setValue,
}: recetasComponentListProps & watchSetValueProps) {

  const { setComponentesListadosReceta, componentesListadosReceta } =
    useRecetasContext();

  const handleDelete = () => {
    if (componentesListadosReceta.length < 1) return;

    const listaFiltrada = componentesListadosReceta.filter(
      (componente) => componente.id_componente !== id,
    );
    setComponentesListadosReceta(listaFiltrada);

    const listaFiltradaValidacion = watch("componente_receta")?.filter(
      ({ componente_id }: { componente_id: number }) => componente_id !== id,
    );
    setValue("componente_receta", listaFiltradaValidacion || []);
  };

  const handleChangeInput = (element: React.ChangeEvent<HTMLInputElement>) => {
    let value = element.target.value;

    // Enforce up to 2 decimal places
    if (value.includes(".")) {
      const [integer, fraction] = value.split(".");
      if (fraction.length > 2) {
        value = `${integer}.${fraction.slice(0, 2)}`;
        element.target.value = value;
      }
    }

    const number = Number(value);

    const componenteIndex = watch("componente_receta")?.findIndex(
      ({ componente_id }: { componente_id: number }) => componente_id === id,
    );
    if (componenteIndex === undefined) return;

    if (isNaN(number) || number <= 0) {
      if (value === "") {
        setValue(`componente_receta.${componenteIndex}.cantidad`, 0);
        return;
      }
      element.target.value = "";
      setValue(`componente_receta.${componenteIndex}.cantidad`, 0);
      return;
    }

    setValue(`componente_receta.${componenteIndex}.cantidad`, number, {
      shouldValidate: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isNumber = /^[0-9]$/.test(e.key);
    const isControlKey = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter",
      "Escape",
      "Home",
      "End",
    ].includes(e.key);
    const isDecimalPoint = e.key === ".";
    const isCombo = e.ctrlKey || e.metaKey;

    if (!isNumber && !isControlKey && !isDecimalPoint && !isCombo) {
      e.preventDefault();
    }

    // Prevent second decimal point
    if (isDecimalPoint && e.currentTarget.value.includes(".")) {
      e.preventDefault();
    }
  };

  const handleBlur = (element: React.FocusEvent<HTMLInputElement, Element>) => {
    if (element.target.value === "" || Number(element.target.value) < 1) {
      element.target.classList.add("border-red-500");
    } else {
      element.target.classList.remove("border-red-500");
    }
  };

  return (
    <div
      className={`flex items-center justify-between text-md py-3 px-5 ${last ? "" : "border-b border-gray-300"}`}
    >
      <span className="font-[Roboto] font-medium">
        {type === "MateriaPrima" ? "Materia Prima " : "Producto Intermedio "} : {nombre}
      </span>

      <div className="flex items-center gap-10">
        <div className="flex items-center gap-4 min-w-[250px]">
          <span className="text-lg font-medium">Cantidad:</span>
          <div className="rounded-md shadow-sm">
            <input
              type="number"
              min={0}
              max={10000}
              step="0.01"
              defaultValue={cantidad > 0 ? cantidad : ''}
              onChange={(e) => handleChangeInput(e)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-20 border border-gray-300 rounded-md px-2 py-2 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-[box-shadow] duration-300"
            />
          </div>
          <span className=" bg-gray-200 text-sm px-2 py-0.5 rounded-sm font-semibold">
            {unidad_medida}
          </span>
        </div>

        <div onClick={handleDelete} className="cursor-pointer">
          <img src={XRedIcon} alt="delete" className="size-6" />
        </div>
      </div>

    </div>
  );
}
