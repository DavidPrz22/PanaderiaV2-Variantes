import FilterButton from "./FilterButton";
import NewButton from "@/components/NewButton";
import SearchInput from "./SearchInput";
import { Button } from "@/components/ui/button";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";
import FiltersPanel from "./FiltersPanel";
import { PackageX, TrendingDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";


export default function FilterSearch() {

  const { setShowProductoForm, bajoStockFilter, setBajoStockFilter, agotadosFilter, setAgotadosFilter } = useProductosFinalesContext();
  const { user } = useAuth();
  const hasAddPermission = userHasPermission(user!, 'productos_elaborados', 'add');

  const toggleBajoStock = () => {
    setBajoStockFilter(!bajoStockFilter);
  }
  const toggleAgotados = () => {
    setAgotadosFilter(!agotadosFilter);
  }

  return (
    <div className="flex items-start px-8 justify-between relative">
      <SearchInput />
      <div className="flex gap-4 relative">
        <Button variant="outline" size="lg" className={`${bajoStockFilter ? "bg-black border-transparent text-white hover:bg-gray-300" : "border-gray-200 shadow-xs "} border cursor-pointer`} onClick={() => toggleBajoStock()}>
          <TrendingDown />
          Bajo Stock
        </Button>
        <Button variant="outline" size="lg" className={`${agotadosFilter ? "bg-black border-transparent text-white hover:bg-gray-300" : "border-gray-200 shadow-xs "} border cursor-pointer`} onClick={() => toggleAgotados()}>
          <PackageX />
          Agotados
        </Button>
        <div className="relative">
          <FilterButton />
          <FiltersPanel />
        </div>
        {hasAddPermission && <NewButton onClick={() => setShowProductoForm(true)} />}
      </div>
    </div>
  );
}
