import { Button } from "@/components/ui/button";
import NewButton from "@/components/NewButton";
import SearchInput from "@/features/Recetas/components/SearchInput";
import { useRecetasContext } from "@/context/RecetasContext";
import { RecetaFechaFiltro } from "./RecetaFechaFiltro";

export default function FilterSearch() {
  const { setShowRecetasForm, setRecetaUnicaFiltro, setRecetaCompuestaFiltro, recetaCompuestaFiltro, recetaUnicaFiltro } = useRecetasContext();

  const toggleFilters = (filter: "compuesta" | "unica") => {
    if (filter === 'compuesta') {
      setRecetaCompuestaFiltro(!recetaCompuestaFiltro);
      setRecetaUnicaFiltro(false)
    }

    if (filter === 'unica') {
      setRecetaUnicaFiltro(!recetaUnicaFiltro);
      setRecetaCompuestaFiltro(false)
    }
  }
  return (
    <div className="flex items-center px-8 justify-between">
      <SearchInput />
      <div className="flex gap-4">
        <Button
          size='lg'
          variant='outline'
          className={`${recetaCompuestaFiltro ? 'bg-gray-700 text-white border-transparent' : ''} hover:bg-gray-700 hover:text-white hover:border-transparent cursor-pointer`}
          onClick={() => {
            toggleFilters('compuesta');
          }}
        >
          Compuestas
        </Button>
        <Button
          size='lg'
          variant='outline'
          className={`${recetaUnicaFiltro ? 'bg-gray-700 text-white border-transparent' : ''} cursor-pointer hover:bg-gray-700 hover:text-white hover:border-transparent`}
          onClick={() => {
            toggleFilters('unica')
          }}
        >
          Únicas
        </Button>
        <RecetaFechaFiltro />
        <NewButton
          onClick={() => {
            setShowRecetasForm(true);
          }}
        />
      </div>
    </div>
  );
}
