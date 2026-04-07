import { useState } from "react";
import type { UseFormSetValue, UseFormWatch, UseFieldArrayReturn, FieldErrors } from "react-hook-form";
import type { TRecetaSchema } from "../schemas/schemas";

import { Plus, Search, Trash2, Wheat, FlaskConical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetComponentesRecetasQuery } from "../hooks/queries/queries";
import type { componenteRecetaItem, componenteRecetaItemConCantidad } from "../types/types";
import { useToast } from "@/utils/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { FormInput } from "@/components/shared";

interface IngredientsModuleProps {
  componentesFieldArray: UseFieldArrayReturn<TRecetaSchema, "componentes">;
  watch: UseFormWatch<TRecetaSchema>;
  setValue: UseFormSetValue<TRecetaSchema>;
  errors: FieldErrors<TRecetaSchema>;
  initialIngredients?: componenteRecetaItemConCantidad[];
}

export function IngredientsModule({ componentesFieldArray, watch, setValue, errors, initialIngredients }: IngredientsModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [displayIngredientes, setDisplayIngredientes] = useState<componenteRecetaItemConCantidad[]>(initialIngredients || []);
  const { data: catalogData } = useGetComponentesRecetasQuery(debouncedSearchTerm);
  const { toast } = useToast();
  const { append: addIngredient, remove: removeIngredient } = componentesFieldArray;


  const handleAddIngredient = (component: componenteRecetaItem) => {

    addIngredient({
      componente_id: component.componente_id,
      tipo: component.tipo,
      cantidad: 0,
    });

    setDisplayIngredientes((prev) => [...prev, {
      ...component,
      unidad_medida: component.unidad_medida,
      componente_id: component.componente_id,
      cantidad: 0,
    }]);

    toast({
      title: "Componente agregado",
      description: `"${component.nombre}" se ha agregado a la receta.`,
      variant: "success",
    });
  };

  const updateCantidadComponent = (index: number, cantidad: number) => {
    setValue(`componentes.${index}.cantidad`, cantidad);
    setDisplayIngredientes((prev) => {
      const newDisplayIngredientes = [...prev];
      newDisplayIngredientes[index].cantidad = cantidad;
      return newDisplayIngredientes;
    });
  };


  const totalCantidad = watch("componentes").reduce((acc, component) => acc + component.cantidad, 0);
  
  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Componentes</h2>
          <p className="text-sm text-muted-foreground">Materias primas y productos intermedios</p>
        </div>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Busca componentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <ScrollArea className="max-h-[300px]">
              {!catalogData || Object.keys(catalogData).length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No se encontraron componentes
                </p>
              ) : (
                <div className="p-1">
                  {Object.entries(catalogData).map(([categoria, items], index) => (
                    <div key={index}>
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-popover">
                        {categoria}
                      </div>
                      {items.map((component: componenteRecetaItem) => (
                        <button
                          key={component.componente_id}
                          type="button"
                          onClick={() => handleAddIngredient(component)}
                          className="w-full flex items-center gap-3 p-3 rounded-md text-left hover:bg-muted/50 transition-colors"
                        >
                          {component.tipo === "MateriaPrima" ? (
                            <div className="h-8 w-8 rounded-md bg-recipe-mp/10 flex items-center justify-center">
                              <Wheat className="h-4 w-4 text-recipe-mp" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-md bg-recipe-pi/10 flex items-center justify-center">
                              <FlaskConical className="h-4 w-4 text-recipe-pi" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {component.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {component.unidad_medida}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              component.tipo === "MateriaPrima"
                                ? "border-recipe-mp/30 text-recipe-mp text-[10px]"
                                : "border-recipe-pi/30 text-recipe-pi text-[10px]"
                            }
                          >
                            {component.tipo === "MateriaPrima" ? "MP" : "PI"}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {errors.componentes?.root?.message && (
        <p className="text-sm font-medium text-destructive mt-2">
          {errors.componentes.root.message}
        </p>
      )}

      {errors.componentes?.message && (
        <p className="text-sm font-medium text-destructive mt-2">
          {errors.componentes.message}
        </p>
      )}

      {/* Ingredients List */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {displayIngredientes.length === 0 ? (
          <div className="p-12 text-center">
            <Wheat className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay componentes listados</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Use el botón "Agregar" para buscar ingredientes
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {displayIngredientes.map((ingredient, index) => {
              const weight = totalCantidad > 0 ? (ingredient.cantidad / totalCantidad) * 100 : 0;
              return (
                <div
                  key={`${ingredient.componente_id}-${index}`}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4 relative">
                    <div
                      className={`absolute inset-y-0 left-0 opacity-[0.04] transition-all ${
                        ingredient.tipo === "MateriaPrima" ? "bg-recipe-mp" : "bg-recipe-pi"
                      }`}
                      style={{ width: `${Math.min(weight, 100)}%` }}
                    />

                      {/* Icon */}
                    <div className="relative z-10">
                      {ingredient.tipo === "MateriaPrima" ? (
                        <div className="h-9 w-9 rounded-md bg-recipe-mp/10 flex items-center justify-center">
                          <Wheat className="size-5 text-recipe-mp" />
                        </div>
                      ) : (
                        <div className="h-9 w-9 rounded-md bg-recipe-pi/10 flex items-center justify-center">
                          <FlaskConical className="size-5 text-recipe-pi" />
                        </div>
                      )}
                    </div>

                      {/* Name & Badge */}
                    <div className="flex-1 min-w-0 relative z-10">
                      <p className="text-md font-medium text-foreground">{ingredient.nombre}</p>
                      <Badge
                        variant="outline"
                        className={`text-sm mt-0.5 ${
                          ingredient.tipo === "MateriaPrima"
                            ? "border-recipe-mp/30 text-recipe-mp"
                            : "border-recipe-pi/30 text-recipe-pi"
                        }`}
                      >
                        {ingredient.tipo === "MateriaPrima" ? "Materia Prima" : "Producto Intermedio"}
                      </Badge>
                    </div>

                      {/* Cantidad */}
                    <div className="flex items-center gap-2 relative z-10">
                      
                        <FormInput
                        type="number"
                        step="0.01"
                        value={ingredient.cantidad || ""}
                        label=""
                        onChange={(e) =>
                          updateCantidadComponent(index, parseFloat(e.target.value))
                        }
                        className="w-24 text-right"
                        error={errors.componentes?.[index]?.cantidad?.message}
                      />
                      <Badge variant="outline" className="text-sm font-normal min-w-[40px] mt-2.5 justify-center">
                        {ingredient.unidad_medida}
                      </Badge>
                    </div>

                      {/* Remove */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive relative z-10"
                      onClick={() => {
                        removeIngredient(index);
                        setDisplayIngredientes(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
