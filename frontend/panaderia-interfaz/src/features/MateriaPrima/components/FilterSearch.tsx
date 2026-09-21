import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";

import FilterButton from "./FilterButton";
import { ImportCSV } from "../../../components/ImportCSV";
import NewButton from "../../../components/NewButton";
import SearchInput from "./SearchInput";
import DownloadSampleDataButton from "@/components/DownloadSampleDataButton";

import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";

import { useImportCSVMutationMateriaPrima } from "@/features/MateriaPrima/hooks/mutations/materiaPrimaMutations"

export default function FilterSearch() {
  const { setShowMateriaprimaForm } = useMateriaPrimaContext();
  const { user } = useAuth();
  const handleNewButtonClick = () => {
    setShowMateriaprimaForm(true);
  };
  const { mutateAsync, isPending } = useImportCSVMutationMateriaPrima()
  const hasPermission = userHasPermission(user!, 'materias_primas', 'add')

  return (
    <div className="flex items-center px-8 justify-between">
      <SearchInput />
      <div className="flex gap-4">
        <DownloadSampleDataButton filePath="/DataMateriasPrimas.csv" fileName="DataMateriasPrimas.csv" />
        {hasPermission && 
        <ImportCSV 
          descripcion="Selecciona un archivo CSV para importay los datos de las materias primas"
          uploadFunction={mutateAsync}
          isPending={isPending}
          csvContent={"nombre,SKU,precio_compra_usd,nombre_empaque_estandar,cantidad_empaque_estandar,unidad_medida_empaque_estandar_id,punto_reorden,unidad_medida_base_id,categoria_id,descripcion\n"}
        />
        }
        <FilterButton />
        {hasPermission && (
        <NewButton onClick={handleNewButtonClick} />
        )}
      </div>
    </div>
  );
}
