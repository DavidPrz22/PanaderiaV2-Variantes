import { XIcon, SearchIcon } from "@/assets/DashboardAssets";
import { useRecetasContext } from "@/context/RecetasContext";
import { useRef, useMemo } from "react";

export default function SearchInput() {

  const { searchTermFilter, setSeachTermFilter } = useRecetasContext()

  const inputRef = useRef<HTMLInputElement>(null)

  const addDebounce = (func: (...args: any[]) => void, delay: number) => {
    let timeOutRef: NodeJS.Timeout | null = null;

    return (...args: any[]) => {
      if (timeOutRef)
        clearTimeout(timeOutRef)
      timeOutRef = setTimeout(() => func(...args), delay)
    }
  }

  const handleSearch = useMemo(() =>
    addDebounce((value: string) => {
      setSeachTermFilter(value)
    }, 250)
    , [setSeachTermFilter])

  const handleReset = () => {
    setSeachTermFilter('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-[var(--search-input-width)] shadow-sm bg-white rounded-full flex items-center justify-between gap-4 p-1 relative border border-gray-200">
      <div className="flex-1 pl-4">
        <input
          id="searchInput"
          type="text"
          placeholder="Buscar receta..."
          className="font-semibold font-[Roboto] outline-none w-full"
          ref={inputRef}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {searchTermFilter && (
        <button
          onClick={handleReset}
          className="absolute right-[13%] flex items-center justify-center p-0.5 rounded-full bg-gray-200 cursor-pointer hover:bg-gray-300 "
        >
          <img className="size-4" src={XIcon} alt="X" />
        </button>
      )}

      <button
        className="bg-blue-500 cursor-pointer transition-colors duration-200 p-2 rounded-full hover:bg-blue-600"
        onClick={() => handleSearch(inputRef.current?.value)}
      >
        <img src={SearchIcon} alt="Search" />
      </button>
    </div>
  );
}
