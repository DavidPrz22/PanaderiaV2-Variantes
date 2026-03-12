import { MenuIcon } from "@/assets/DashboardAssets";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";

export default function FilterButton() {
  const { showFiltersPanel, setShowFiltersPanel } = useProductosFinalesContext();
  return (
    <button
      id="pf-filters-anchor"
      type="button"
      className="flex shadow-md gap-2 items-center bg-blue-500 cursor-pointer transition-colors duration-200 px-4 py-2 rounded-md hover:bg-blue-600 font-semibold font-[Roboto] text-white"
      onClick={() => setShowFiltersPanel(!showFiltersPanel)}
      aria-expanded={showFiltersPanel}
      aria-controls="pf-filters-panel"
    >
      <img src={MenuIcon} alt="Menu" />
      Filtros
    </button>
  );
}
