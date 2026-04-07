import { ArrowLeft, BookOpen, Wheat, FlaskConical, Link2, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecetaDetallesQuery } from "../hooks/queries/queries";
import { useRecetasContext } from "@/context/RecetasContext";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecipeDetailsPanelProps {
  onClose: () => void;
}

export function RecipeDetailsPanel({ onClose }: RecipeDetailsPanelProps) {

  const { recetaId, setUpdateRegistro, setShowRecetasForm, setShowRecetasDetalles } = useRecetasContext();
  const { data: recipeDetails, isFetching } = useRecetaDetallesQuery(recetaId!);
  console.log(recipeDetails);
  const piIngredients = recipeDetails?.componentes.filter((c) => c.tipo === 'ProductoIntermedio') || [];
  const mpIngredients = recipeDetails?.componentes.filter((c) => c.tipo === 'MateriaPrima') || [];
  const totalCantidad = recipeDetails?.componentes.reduce((acc, c) => acc + c.cantidad, 0) || 0;

  const relatedRecipes = recipeDetails?.relaciones_recetas || [];

  const handleUpdate = () => {
    setUpdateRegistro(true);
    setShowRecetasForm(true);
    setShowRecetasDetalles(false);
  };
    
  return (
    <div className="h-full flex flex-col bg-background font-[Roboto]">
      {isFetching && (
        <div className="flex items-center gap-3 border-b bg-card px-8 py-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Cargando...</h1>
          </div>
        </div>
      )}
      <div
        className="gap-3 border-b"
      >
        <div className="flex items-center gap-3 max-w-5xl mx-auto px-8 py-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <BookOpen className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{recipeDetails?.receta.nombre}</h1>
            <p className="text-sm text-muted-foreground">Creada el {recipeDetails?.receta.fecha_creacion?.split("T")[0]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleUpdate}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => {}}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            {/* Yield */}
            <>
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Rendimiento
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-foreground">{recipeDetails?.receta.rendimiento}</span>
                  <Badge variant="outline" className="text-sm">{recipeDetails?.receta.producto_elaborado?.unidad_medida}</Badge>
                </div>
              </div>
            </>

            {/* Ingredients */}
            <div className="space-y-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Componentes</h2>

              {piIngredients.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-recipe-pi" />
                    Productos Intermedios
                  </h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingrediente</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Peso %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {piIngredients.map((ing) => (
                          <TableRow key={ing.componente_id}>
                            <TableCell className="font-medium">{ing.nombre}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-recipe-pi/30 text-recipe-pi text-xs">
                                PI
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {ing.cantidad} {ing.unidad_medida}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {totalCantidad > 0 ? ((ing.cantidad / totalCantidad) * 100).toFixed(1) : 0}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {mpIngredients.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Wheat className="h-4 w-4 text-recipe-mp" />
                    Materias Primas
                  </h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingrediente</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Peso %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mpIngredients.map((ing) => (
                          <TableRow key={ing.componente_id}>
                            <TableCell className="font-medium">{ing.nombre}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-recipe-mp/30 text-recipe-mp text-xs">
                                MP
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {ing.cantidad} {ing.unidad_medida}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {totalCantidad > 0 ? ((ing.cantidad / totalCantidad) * 100).toFixed(1) : 0}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Related Recipes */}
              {relatedRecipes.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Recetas Relacionadas
                  </h2>
                  <div className="bg-card border rounded-lg divide-y">
                    {relatedRecipes.map((related) => {
                      return (
                        <div key={related.id} className="flex items-center gap-3 p-4">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {related?.nombre}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Notes */}
              {recipeDetails?.receta.notas && (
                <>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Notas</h2>
                  <div className="bg-card border rounded-lg p-6">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{recipeDetails?.receta.notas}</p>
                  </div>
                </>
              )}
            </div>
        </div>
      </ScrollArea>
    
    </div>
  );
}
