import FilterButton from "./FilterButton";
import PIFiltersPanel from "./PIFiltersPanel";
import NewButton from "@/components/NewButton";
import SearchInput from "@/features/ProductosIntermedios/components/SearchInput";
import { Button } from "@/components/ui/button";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { PackageX, TrendingDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";

export default function FilterSearch() {
  const { setShowProductosIntermediosForm, bajoStockFilter, setBajoStockFilter, agotadosFilter, setAgotadosFilter } = useProductosIntermediosContext();
  const { user } = useAuth();
  const hasAddPermission = userHasPermission(user!, 'productos_elaborados', 'add');

  const toggleBajoStock = () => {
    setBajoStockFilter(!bajoStockFilter);
  }
  const toggleAgotados = () => {
    setAgotadosFilter(!agotadosFilter);
  }

  return (
    <div className="flex items-center px-8 justify-between relative">
      <SearchInput />
      <div className="flex gap-4 relative" id="pi-filters-anchor">
        <Button variant="outline" size="lg" className={`${bajoStockFilter ? "bg-black border-transparent text-white hover:bg-gray-300" : "border-gray-200 shadow-xs "} border cursor-pointer`} onClick={() => toggleBajoStock()}>
          <TrendingDown />
          Bajo Stock
        </Button>
        <Button variant="outline" size="lg" className={`${agotadosFilter ? "bg-black border-transparent text-white hover:bg-gray-300" : "border-gray-200 shadow-xs "} border cursor-pointer`} onClick={() => toggleAgotados()}>
          <PackageX />
          Agotados
        </Button>
        <FilterButton />
        {hasAddPermission && (
          <NewButton
            onClick={() => {
              setShowProductosIntermediosForm(true);
            }}
          />
        )}
        <PIFiltersPanel />
      </div>
    </div>
  );
}
