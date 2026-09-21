import FilterButton from "./FilterButton";
import PFFiltersPanel from "./PFFiltersPanel";
import NewButton from "@/components/NewButton";
import SearchInput from "@/features/ProductosFinales/components/SearchInput";
import { Button } from "@/components/ui/button";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";
import { PackageX, TrendingDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";
import DownloadSampleDataButton from "@/components/DownloadSampleDataButton";
import { ImportCSV } from "@/components/ImportCSV";
import { useUploadCSVProductosFinalesMutation } from "../hooks/mutations/productosFinalesMutations";

export default function FilterSearch() {
  const { setShowProductoForm, bajoStockFilter, setBajoStockFilter, agotadosFilter, setAgotadosFilter } = useProductosFinalesContext();
  const { user } = useAuth();
  const hasAddPermission = userHasPermission(user!, 'productos_elaborados', 'add');
  const { mutateAsync, isPending } = useUploadCSVProductosFinalesMutation();

  const toggleBajoStock = () => {
    setBajoStockFilter(!bajoStockFilter);
  }
  const toggleAgotados = () => {
    setAgotadosFilter(!agotadosFilter);
  }

  return (
    <div className="flex items-center px-8 justify-between relative">
      <SearchInput />
      <div className="flex gap-4 relative" id="pf-filters-anchor">
        <Button variant="outline" size="lg" className={`${bajoStockFilter ? "bg-black border-transparent text-white hover:bg-gray-300" : "border-gray-200 shadow-xs "} border cursor-pointer`} onClick={() => toggleBajoStock()}>
          <TrendingDown />
          Bajo Stock
        </Button>
        <Button variant="outline" size="lg" className={`${agotadosFilter ? "bg-black border-transparent text-white hover:bg-gray-300" : "border-gray-200 shadow-xs "} border cursor-pointer`} onClick={() => toggleAgotados()}>
          <PackageX />
          Agotados
        </Button>
        <DownloadSampleDataButton filePath="/DataProductosElaborados_Final.csv" fileName="DataProductosElaborados_Final.csv" />
        {hasAddPermission && (
          <ImportCSV 
            descripcion="Selecciona un archivo CSV para importar los datos de los productos finales"
            uploadFunction={mutateAsync}
            isPending={isPending}
            csvContent={"nombre_producto,SKU,descripcion,unidad_produccion_id,unidad_venta_id,precio_venta_usd,punto_reorden,categoria_id,es_intermediario,tipo_medida_fisica,vendible_por_medida_real\n"}
          />
        )}
        <FilterButton />
        {hasAddPermission && (
          <NewButton
            onClick={() => {
              setShowProductoForm(true);
            }}
          />
        )}
        <PFFiltersPanel />
      </div>
    </div>
  );
}
