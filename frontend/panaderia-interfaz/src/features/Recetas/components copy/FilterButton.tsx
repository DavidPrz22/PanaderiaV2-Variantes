import { MenuIcon } from "@/assets/DashboardAssets";

export default function FilterButton() {
  return (
    <button
      type="button"
      className="flex shadow-md gap-2 items-center bg-blue-500 cursor-pointer transition-colors duration-200 p-2 rounded-md hover:bg-blue-600 font-semibold font-[Roboto] text-white"
      onClick={() => {}}
    >
      <img src={MenuIcon} alt="Menu" />
      Filtros
    </button>
  );
}
