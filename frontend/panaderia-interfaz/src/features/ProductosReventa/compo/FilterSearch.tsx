import FilterButton from "./FilterButton";
import FiltersPanel from "./FiltersPanel";
import NewButton from "@/components/NewButton";
import SearchInput from "./SearchInput";
import { Button } from "@/components/ui/button";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { PackageX, TrendingDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";
import { ImportCSV } from "@/components/ImportCSV";
import { useUploadCSVProductosReventaMuatation } from '@/features/ProductosReventa/hooks/mutations/productosReventaMutations'

export default function FilterSearch() {
  const { setShowProductosReventaForm, bajoStockFilter, setBajoStockFilter, agotadosFilter, setAgotadosFilter } = useProductosReventaContext();
  const { mutateAsync, isPending } = useUploadCSVProductosReventaMuatation()
  const { user } = useAuth();

  const hasAddPermission = userHasPermission(user!, 'productos_reventa', 'add');

  const toggleBajoStock = () => {
    setBajoStockFilter(!bajoStockFilter);
  }
  const toggleAgotados = () => {
    setAgotadosFilter(!agotadosFilter);
  }


  return (
    <div className="flex items-center px-8 justify-between">
      <SearchInput />
      <div className="flex gap-4">
        <Button variant="outline" size="lg" className={`${bajoStockFilter ? "bg-black border-transparent text-white hover:bg-gray-300" : "border-gray-200 shadow-xs "} border cursor-pointer`} onClick={() => toggleBajoStock()}>
          <TrendingDown />
          Bajo Stock
        </Button>
        <Button variant="outline" size="lg" className={`${agotadosFilter ? "bg-black border-transparent text-white hover:bg-gray-300" : "border-gray-200 shadow-xs "} border cursor-pointer`} onClick={() => toggleAgotados()}>
          <PackageX />
          Agotados
        </Button>

        {hasAddPermission && (
          <ImportCSV
            descripcion="Selecciona un archivo CSV para importar los datos de los productos de reventa"
            uploadFunction={mutateAsync}
            isPending={isPending}
            csvContent={"nombre_producto,SKU,categoria_id,marca,precio_venta_usd,precio_compra_usd,punto_reorden,unidad_medida_base,proveedor_preferido,unidad_base_inventario,unidad_venta,factor_conversion,descripcion,perecedero\n"}
          />
        )}
        <div className="relative">
          <FilterButton />
          <FiltersPanel />
        </div>

        {hasAddPermission && (
          <NewButton
            onClick={() => {
              setShowProductosReventaForm(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
