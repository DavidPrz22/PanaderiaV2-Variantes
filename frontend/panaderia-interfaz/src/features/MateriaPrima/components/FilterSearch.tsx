import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";

import FilterButton from "./FilterButton";
import { ImportCSV } from "../../../components/ImportCSV";
import NewButton from "../../../components/NewButton";
import SearchInput from "./SearchInput";
import DownloadSampleDataButton from "@/components/DownloadSampleDataButton";

import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";

import { useImportYAMLMutationMateriaPrima } from "@/features/MateriaPrima/hooks/mutations/materiaPrimaMutations"

export default function FilterSearch() {
  const { setShowMateriaprimaForm } = useMateriaPrimaContext();
  const { user } = useAuth();
  const handleNewButtonClick = () => {
    setShowMateriaprimaForm(true);
  };
  const { mutateAsync, isPending } = useImportYAMLMutationMateriaPrima()
  const hasPermission = userHasPermission(user!, 'materias_primas', 'add')

  return (
    <div className="flex items-center px-8 justify-between">
      <SearchInput />
      <div className="flex gap-4">
        <DownloadSampleDataButton filePath="/DataMateriasPrimas.yaml" fileName="DataMateriasPrimas.yaml" label="Ejemplo YAML" />
        {hasPermission && 
        <ImportCSV 
          descripcion="Selecciona un archivo YAML para importar los datos de las materias primas"
          uploadFunction={mutateAsync}
          isPending={isPending}
          fileType="yaml"
          csvContent={`- nombre: ""
  SKU: ""
  punto_reorden: 0
  unidad_medida_base_id: null
  categoria_id: null
  descripcion: ""
  variantes:
    - nombre_variante: ""
      unidad_compra: null
      SKU_variante: ""
      precio_compra_divisa: 0
      precio_compra_local: 0
      nombre_empaque_estandar: ""
      cantidad_empaque_estandar: 0
      unidad_medida_empaque_estandar: null
`}
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
