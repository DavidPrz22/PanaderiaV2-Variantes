import { useState } from "react";
import { Button } from "@/components/ui/button";
import NewButton from "@/components/NewButton";
import SearchInput from "@/features/Recetas/components/SearchInput";
import { useRecetasContext } from "@/context/RecetasContext";
import { RecetaFechaFiltro } from "./RecetaFechaFiltro";
import { useGenerarRecetasMutation } from "../hooks/mutations/recetasMutations";
import { useToast } from "@/utils/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function FilterSearch() {
  const { setShowRecetasForm, setRecetaUnicaFiltro, setRecetaCompuestaFiltro, recetaCompuestaFiltro, recetaUnicaFiltro } = useRecetasContext();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const generarRecetasMutation = useGenerarRecetasMutation();
  const { toast } = useToast();

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

  const handleGenerarRecetas = () => {
    generarRecetasMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Éxito",
          description: "Recetas generadas exitosamente",
        });
        setShowConfirmDialog(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Error al generar las recetas",
          variant: "destructive",
        });
        setShowConfirmDialog(false);
      },
    });
  };

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
        <Button
          size='lg'
          variant='outline'
          className="cursor-pointer hover:bg-green-700 hover:text-white hover:border-transparent"
          onClick={() => setShowConfirmDialog(true)}
          disabled={generarRecetasMutation.isPending}
        >
          {generarRecetasMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generar Recetas
        </Button>
        <NewButton
          onClick={() => {
            setShowRecetasForm(true);
          }}
        />
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generar Recetas</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas generar las recetas desde el archivo YAML? Esta acción creará nuevas recetas en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={generarRecetasMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleGenerarRecetas();
              }}
              disabled={generarRecetasMutation.isPending}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {generarRecetasMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {generarRecetasMutation.isPending ? "Generando..." : "Generar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
