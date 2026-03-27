import { useRecetasContext } from "@/context/RecetasContext";
import type { RecetasFormSearchInputProps } from "../types/types";

export default function RecetaListSearchInput({
  typeInput,
  placeholder = "",
  onChange,
}: RecetasFormSearchInputProps) {
  const {
    searchListRecetaListRef,
    setSearchListActiveRecetaList,
    setSearchListRecetaList,
    searchListRecetaList,
  } = useRecetasContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      if (e.target.value === "") {
        setSearchListRecetaList([]);
      } else {
        onChange(e.target.value);
      }
    }

    setSearchListActiveRecetaList(true);
  };

  const resetSearchList = () => {
    setSearchListActiveRecetaList(false);
    setSearchListRecetaList([]);
    if (searchListRecetaListRef.current) {
      searchListRecetaListRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        type={typeInput}
        onChange={handleChange}
        ref={searchListRecetaListRef as React.RefObject<HTMLInputElement>}
        placeholder={placeholder}
        className="block w-full px-3 py-4 border border-gray-300 rounded-md shadow-xs font-[Roboto]
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {searchListRecetaList.length > 0 && (
        <div
          className="absolute right-2 bottom-2.5 flex items-center justify-center border border-gray-300 px-2 py-1 rounded-md cursor-pointer"
          onClick={resetSearchList}
        >
          Cerrar
        </div>
      )}
    </div>
  );
}
