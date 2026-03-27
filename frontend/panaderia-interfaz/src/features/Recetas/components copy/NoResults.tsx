export default function NoResults() {
  return (
    <div
      className="flex flex-col justify-center px-4 border border-gray-300 w-full h-[var(--search-list-short-height)] shadow-lg
                        font-[Roboto] text-md font-semibold
                        overflow-y-auto absolute top-[86px] left-0 bg-white z-10"
    >
      Ningun componente encontrado...
    </div>
  );
}
