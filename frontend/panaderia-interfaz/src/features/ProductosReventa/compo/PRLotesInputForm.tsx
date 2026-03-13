import type { PRLotesFormInputProps } from "../types/types";

const PRLotesInputForm = ({
  register,
  name,
  typeInput,
  placeholder,
}: PRLotesFormInputProps) => {
  return (
    <input
      {...register(name)}
      type={typeInput}
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
      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default PRLotesInputForm;