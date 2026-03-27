import { useState } from "react";
import type { UseFieldArrayReturn, UseFormWatch, FieldErrors } from "react-hook-form";
import { Link2, Search, X, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TRecetaSchema } from "../schemas/schemas";
import { useGetRecetasSearchQuery } from "../hooks/queries/queries";
import type { RecetaRelacionada } from "../types/types";
import { useDebounce } from "@/hooks/useDebounce";

interface RelationsModuleProps {
  recetasRelacionadasFieldArray: UseFieldArrayReturn<TRecetaSchema, "recetas_relacionadas">;
  watch: UseFormWatch<TRecetaSchema>;
  errors: FieldErrors<TRecetaSchema>;
  initialRelations?: RecetaRelacionada[];
}

export function RelationsModule({ recetasRelacionadasFieldArray, errors, initialRelations }: RelationsModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [recetasListadas, setRecetasListadas] = useState<RecetaRelacionada[]>(initialRelations || []);

  const { data: recetasSearch } = useGetRecetasSearchQuery(debouncedSearchTerm);

  const { append, remove } = recetasRelacionadasFieldArray;

  const displayRecetas = recetasSearch || [];

  const addRelation = (recetaId: number, nombre: string) => {
    append({ receta_id: recetaId });
    setSearchTerm("");
    setPopoverOpen(false);
    setRecetasListadas((prev) => [...prev, { id: recetaId, nombre }]);
  };

  const removeRelation = (index: number) => {
    remove(index);
    setRecetasListadas((prev) => prev.filter((_, i) => i !== index));
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Receta Relacionada</h2>
          <p className="text-sm text-muted-foreground">Vincular sub-recetas o recetas dependientes</p>
        </div>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Link2 className="h-4 w-4 mr-2" />
              Vincular
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Busca una receta relacionada..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[250px]">
              {displayRecetas.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No hay recetas disponibles
                </p>
              ) : (
                <div className="p-1">
                  {displayRecetas.map((receta) => (
                    <button
                      key={receta.id}
                      type="button"
                      onClick={() => addRelation(receta.id, receta.nombre)}
                      className="w-full flex items-center gap-3 p-3 rounded-md text-left hover:bg-muted/50 transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground truncate">
                        {receta.nombre}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {errors.recetas_relacionadas?.message && (
        <p className="text-sm font-medium text-destructive mt-2">
          {errors.recetas_relacionadas.message}
        </p>
      )}

      {/* Relations List */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {recetasListadas.length === 0 ? (
          <div className="p-12 text-center">
            <Link2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay recetas listadas</p>
          </div>
        ) : (
          <div className="divide-y">
            {recetasListadas.map((rel, index) => (
              <div key={rel.id} className="flex items-center gap-3 p-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="flex-1 text-sm font-medium text-foreground">
                  {rel.nombre}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRelation(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
