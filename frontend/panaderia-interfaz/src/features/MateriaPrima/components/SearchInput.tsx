import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";
import { XIcon, SearchIcon } from "@/assets/DashboardAssets";

export default function SearchInput() {
  const {
    searchInputRef,
    MPFilteredInputSearchApplied,
  } = useMateriaPrimaContext();


  return (
    <div className="w-[400px] shadow-sm bg-white rounded-full flex items-center justify-between gap-4 p-1 relative border border-gray-200">
      <div className="flex-1 pl-4">
        <input
          id="searchInput"
          type="text"
          placeholder="Buscar materia prima..."
          className="font-semibold font-[Roboto] outline-none w-full"
          ref={searchInputRef}
        />
      </div>
      {MPFilteredInputSearchApplied && (
        <button
          className="absolute right-[13%] flex items-center justify-center p-0.5 rounded-full bg-gray-200 cursor-pointer hover:bg-gray-300 "
        >
          <img className="size-4" src={XIcon} alt="X" />
        </button>
      )}

      <button
        className="bg-blue-500 cursor-pointer transition-colors duration-200 p-2 rounded-full hover:bg-blue-600"
      >
        <img src={SearchIcon} alt="Search" />
      </button>
    </div>
  );
}
