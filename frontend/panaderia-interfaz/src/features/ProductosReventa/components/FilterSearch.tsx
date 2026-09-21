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
import { useUploadYAMLProductosReventaMutation } from '@/features/ProductosReventa/hooks/mutations/productosReventaMutations';
import DownloadSampleDataButton from "@/components/DownloadSampleDataButton";

export default function FilterSearch() {
  const { setShowProductosReventaForm, bajoStockFilter, setBajoStockFilter, agotadosFilter, setAgotadosFilter } = useProductosReventaContext();
  const { mutateAsync, isPending } = useUploadYAMLProductosReventaMutation()
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
        <DownloadSampleDataButton filePath="/DataProductosReventa.yaml" fileName="DataProductosReventa.yaml" label="Ejemplo YAML" />
        {hasAddPermission && (
          <ImportCSV
            descripcion="Selecciona un archivo YAML para importar los datos de los productos de reventa"
            uploadFunction={mutateAsync}
            isPending={isPending}
            fileType="yaml"
            csvContent={`- nombre_producto: ""
  descripcion: ""
  categoria_id: null
  marca: ""
  proveedor_preferido: null
  unidad_base_inventario: null
  unidad_venta: null
  factor_conversion: 1.0
  es_perecedero: false
  variantes:
    - nombre_variante: ""
      SKU: ""
      descripcion: ""
      atributo: CANTIDAD
      precio_venta_divisa: 0
      precio_venta_local: 0
      costo_divisa: 0
      costo_local: 0
      punto_reorden: 0
      is_vendible: true
`}
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
