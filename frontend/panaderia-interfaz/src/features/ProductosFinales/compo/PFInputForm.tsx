import type { PFFormInputProps } from "../types/types";

export default function PFInputForm({
  typeInput,
  name,
  placeholder = "",
  register,
  disabled,
}: PFFormInputProps & { disabled?: boolean }) {
  let inputElement: React.ReactNode = <></>;
  if (typeInput === "textarea") {
    inputElement = (
      <textarea
        {...register(name)}
        name={name}
        placeholder={placeholder}
        rows={4}
        className=" block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs font-[Roboto]
                                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                                            sm:text-sm resize-none"
      />
    );
  } else {
    inputElement = (
      <input
        disabled={disabled}
        type={typeInput}
        {...register(name)}
        name={name}
        step="any"
        min={typeInput === "number" ? "0" : undefined}
        onKeyDown={(e) => {
          if (typeInput === "number") {
            const isNumber = /^[0-9]$/.test(e.key);
            const isControlKey = [
              "Backspace",
              "Delete",
              "ArrowLeft",
              "ArrowRight",
              "Tab",
              "Enter",
              "Escape",
            ].includes(e.key);
            const isDecimalPoint = e.key === ".";
            const isCombo = e.ctrlKey || e.metaKey;

            if (!isNumber && !isControlKey && !isDecimalPoint && !isCombo) {
              e.preventDefault();
            }
          }
        }}
        onPaste={(e) => {
          if (typeInput === "number") {
            const pasteData = e.clipboardData.getData("text");
            if (!/^\d*\.?\d*$/.test(pasteData)) {
              e.preventDefault();
            }
          }
        }}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        inputMode={typeInput === "number" ? "decimal" : undefined}
        placeholder={placeholder}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs font-[Roboto]
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                    ${typeInput === "number"
            ? `/* Tailwind's way to hide WebKit arrows */
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                    
                    /* Tailwind's way to hide Firefox arrows */
                    [appearance:textfield]`
            : ""
          }`}
      />
    );
  }
  return inputElement;
}
