import type { watchSetvalueTypeProduction } from "../types/types";
import { useProductionContext } from "@/context/ProductionContext";
import "@/styles/validationStyles.css";

import { useComponentsProductionQuery } from "../hooks/queries/ProductionQueries";
import { useEffect, useRef } from "react";

export const ProductionCantidad = ({
  setValue,
  watch,
}: watchSetvalueTypeProduction) => {

  const { productUnitRef } = useProductionContext();
  const { data: productionComponentes, isFetched } = useComponentsProductionQuery();
  const inputRef = useRef<HTMLInputElement>(null);

  const roundTo3 = (n: number) => Math.round(n * 1000) / 1000;

  useEffect(() => {
    // Logic to initialize quantity when product/recipe loads
    if (productionComponentes) {
      if (productionComponentes.rendimiento && productionComponentes.rendimiento > 0) {

        // Priority 1: Use Recipe Yield if available
        if (setValue) {
          setValue("cantidadProduction", productionComponentes.rendimiento, {
            shouldValidate: true,
            shouldDirty: true,
          });
          if (inputRef.current) {
            inputRef.current.value = productionComponentes.rendimiento.toString();
            inputRef.current.focus();
          }
        }
      } else {
        // Priority 2: Default to 1 if no yield is defined and current value is 0/invalid
        const currentVal = watch?.("cantidadProduction");
        if (!currentVal || currentVal <= 0) {
          if (setValue) {
            setValue("cantidadProduction", 1, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }
        }
      }
    }
  }, [productionComponentes, isFetched, setValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(",", ".");
    const parsed = parseFloat(raw);
    if (raw === "" || parsed < 0 || isNaN(parsed)) {
      if (setValue) setValue("cantidadProduction", 0);
      return;
    }
    const value = roundTo3(parsed);
    if (setValue)
      setValue("cantidadProduction", value, {
        shouldValidate: true,
        shouldDirty: true,
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const controls = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];
    if (controls.includes(e.key)) return;

    // Allow one decimal separator
    if (e.key === "." || e.key === ",") {
      const v = (e.currentTarget as HTMLInputElement).value;
      if (v.includes(".") || v.includes(",")) e.preventDefault();
      return;
    }
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      e.target.value === "" ||
      parseFloat(e.target.value) <= 0 ||
      isNaN(parseFloat(e.target.value))
    ) {
      e.target.value = "0";
      if (e.target.classList.contains("validInput")) {
        e.target.classList.remove("validInput");
        e.target.classList.add("invalidInput");
      }
    } else {
      e.target.classList.remove("invalidInput");
      e.target.classList.add("validInput");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-2 w-full">
      <div className="font-semibold font-[Roboto]">Cantidad a Producir</div>
      <div className="flex gap-2">
        <div className="w-full relative">
          <input
            id="cantidadProduction"
            type="number"
            className="px-2 py-[0.95rem] w-full outline-none border border-gray-300 rounded-md focus:ring-4 transition-[box-shadow] duration-300 validInput"
            min={0}
            step={0.01}
            placeholder="Cantidad a producir..."
            defaultValue={watch?.("cantidadProduction") ?? 0}
            // If the user manually changes the input, we update the state
            key={productionComponentes?.rendimiento}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            ref={inputRef}
          />
          <div
            className="absolute top-1/2 right-9 -translate-y-1/2 text-sm font-medium font-[Roboto] pointer-events-none"
          >
            <div
              ref={productUnitRef}
              className={`flex items-center justify-center bg-gray-200 rounded-md ${productUnitRef.current?.textContent === "" ? "" : "size-7"
                }`}
            >
              {productUnitRef.current?.textContent}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
