import { MenuIcon } from "@/assets/DashboardAssets";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";

export default function FilterButton() {
  const { showPIFiltersPanel, setShowPIFiltersPanel } =
    useProductosIntermediosContext();
  return (
    <button
      id="pi-filters-anchor"
      type="button"
      className="flex shadow-md gap-2 items-center bg-blue-500 cursor-pointer transition-colors duration-200 px-4 py-2 rounded-md hover:bg-blue-600 font-semibold font-[Roboto] text-white"
      onClick={() => setShowPIFiltersPanel(!showPIFiltersPanel)}
      aria-expanded={showPIFiltersPanel}
      aria-controls="pi-filters-panel"
    >
      <img src={MenuIcon} alt="Menu" />
      Filtros
    </button>
  );
}
