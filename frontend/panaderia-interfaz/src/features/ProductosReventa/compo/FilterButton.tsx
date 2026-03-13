import { MenuIcon } from "@/assets/DashboardAssets";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";

export default function FilterButton() {
  const { showPRFiltersPanel, setShowPRFiltersPanel } = useProductosReventaContext();
  return (
    <button
      id="pr-filters-anchor"
      type="button"
      className="flex shadow-md gap-2 items-center bg-blue-500 cursor-pointer transition-colors duration-200 px-4 py-2 rounded-md hover:bg-blue-600 font-semibold font-[Roboto] text-white"
      onClick={() => setShowPRFiltersPanel(!showPRFiltersPanel)}
      aria-expanded={showPRFiltersPanel}
      aria-controls="pr-filters-panel"
    >
      <img src={MenuIcon} alt="Menu" />
      Filtros
    </button>
  );
}
