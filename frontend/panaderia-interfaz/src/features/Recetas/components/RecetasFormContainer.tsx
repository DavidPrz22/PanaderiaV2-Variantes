import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/utils/use-toast";
import { GeneralInfoSection } from "./RecetasGeneralInfo";
import { ProductSelectorSection } from "./RecetasProductoSelector";
import { YieldSection } from "./RecetaRendimiento";
import { IngredientsModule } from "./RecetasComponentes";
import { RelationsModule } from "./RecetasRelations";
import { useRegisterUpdateRecetaMutation } from "../hooks/mutations/recetasMutations";
import { useFieldArray } from "react-hook-form";
import { useRecetasContext } from "@/context/RecetasContext";
import { useRecetaDetallesQuery } from "../hooks/queries/queries";
import type { componenteRecetaItemConCantidad, RecetaRelacionada } from "../types/types";

import { Form } from "@/components/ui/form";
import { recetaSchema, type TRecetaSchema } from "@/features/Recetas/schemas/schemas";

interface RecetaFormContainerProps {
  onClose: () => void;
}

/**
 * Main wrapper that handles data fetching and conditional rendering
 */
export function RecetaForma({ onClose }: RecetaFormContainerProps) {
  const { updateRegistro, recetaId, setUpdateRegistro, setSelectedItemProducto } = useRecetasContext();
  
  // Only fetch if we are in update mode
  const { data: recipeDetails, isLoading } = useRecetaDetallesQuery(updateRegistro ? recetaId! : 0);

  // Synchronize context state for the product selector
  useEffect(() => {
    if (updateRegistro && recipeDetails?.receta.producto_elaborado) {
      setSelectedItemProducto({
        producto_id: 0,
        nombre_producto: recipeDetails.receta.producto_elaborado.nombre.split(" - ")[0],
        tipo: "ProductoFinal",
        unidad_produccion: recipeDetails.receta.producto_elaborado.unidad_medida,
        variantes: [{
          id: recipeDetails.receta.producto_elaborado.id,
          nombre_variante: recipeDetails.receta.producto_elaborado.nombre.split(" - ").slice(1).join(" - ") || "",
          SKU: ""
        }]
      });
    }
  }, [updateRegistro, recipeDetails, setSelectedItemProducto]);

  // Map backend data to form schema structure
  const initialValues = useMemo(() => {
    if (updateRegistro && recipeDetails) {
      return {
        nombre: recipeDetails.receta.nombre,
        producto_elaborado_variante: recipeDetails.receta.producto_elaborado?.id,
        rendimiento: recipeDetails.receta.rendimiento,
        notas: recipeDetails.receta.notas || "",
        componentes: recipeDetails.componentes.map(comp => ({
          componente_id: comp.id,
          tipo: comp.tipo as "MateriaPrima" | "ProductoIntermedio",
          cantidad: comp.cantidad
        })),
        recetas_relacionadas: (recipeDetails.relaciones_recetas || []).map(rel => ({
          receta_id: rel.id
        }))
      } as TRecetaSchema;
    }
    return undefined;
  }, [updateRegistro, recipeDetails]);

  const handleClose = () => {
    setUpdateRegistro(false);
    onClose();
  };

  // Condition: If updating, wait for data. If creating, just render.
  if (updateRegistro && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-lg shadow-sm font-[Roboto]">
        <div className="text-lg font-medium text-muted-foreground animate-pulse">
          Cargando datos de la receta...
        </div>
      </div>
    );
  }

  return (
    <RecetaFormContent 
      key={updateRegistro ? `edit-${recetaId}` : 'new-recipe'}
      onClose={handleClose} 
      initialData={initialValues} 
      isUpdate={updateRegistro}
      recetaId={updateRegistro ? recetaId : undefined}
      initialIngredients={recipeDetails?.componentes}
      initialRelations={recipeDetails?.relaciones_recetas}
    />
  );
}

/**
 * Presentational component that initializes the form with defaultValues
 */
function RecetaFormContent({ 
  onClose, 
  initialData, 
  isUpdate,
  recetaId,
  initialIngredients,
  initialRelations
}: { 
  onClose: () => void; 
  initialData?: TRecetaSchema;
  isUpdate: boolean;
  recetaId?: number | null;
  initialIngredients?: componenteRecetaItemConCantidad[];
  initialRelations?: RecetaRelacionada[];
}) {
  const { toast } = useToast();
  const { mutateAsync: registerUpdateReceta } = useRegisterUpdateRecetaMutation();

  const form = useForm<TRecetaSchema>({
    resolver: zodResolver(recetaSchema),
    defaultValues: initialData ?? {
      nombre: "",
      producto_elaborado_variante: null,
      rendimiento: 0,
      componentes: [],
      recetas_relacionadas: [],
      notas: "",
    },
  });

  const { handleSubmit, control, watch, setValue, formState: { errors } } = form;

  const componentesFieldArray = useFieldArray({
    control,
    name: "componentes",
  });

  const recetasRelacionadasFieldArray = useFieldArray({
    control,
    name: "recetas_relacionadas",
  });

  const onSubmit = async (data: TRecetaSchema) => {
    const id = isUpdate ? recetaId! : undefined;
    await registerUpdateReceta({ data, id }, {
      onSuccess(data) {
        toast({
          title: id ? "Receta actualizada" : "Receta guardada",
          description: `"${data.nombre}" se ha ${id ? 'actualizada' : 'guardada'} exitosamente.`,
          variant: "success",
        });
        onClose();
      },
    });
  };

  const onInvalid = (errors: any) => {
    console.log("Validation errors:", errors);
    toast({
      title: "Error de validación",
      description: "Por favor revise los campos en rojo en el formulario.",
      variant: "destructive",
    });
  };
  
  return (
    <div className="flex flex-col font-[Roboto] bg-gray-100/50">
      {/* Header */}
      <div className="px-8 pb-6 border-b border-border bg-white">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            {isUpdate ? "Editar Receta" : "Nueva Receta"}
          </h1>
        </div>
      </div>

      {/* Form Body */}
      <div className="flex-1">
        <Form {...form}>
          <form className="max-w-5xl mx-auto p-8 space-y-8" onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <GeneralInfoSection control={control} errors={errors} />

            <ProductSelectorSection control={control} watch={watch} setValue={setValue} errors={errors} />

            <YieldSection control={control} errors={errors} />

            <IngredientsModule 
              componentesFieldArray={componentesFieldArray} 
              watch={watch} 
              setValue={setValue} 
              errors={errors} 
              initialIngredients={initialIngredients}
            />

            <RelationsModule 
              recetasRelacionadasFieldArray={recetasRelacionadasFieldArray} 
              watch={watch} 
              errors={errors}
              initialRelations={initialRelations}
            />
          </form>
        </Form>
      </div>

      <div className="px-8 pt-6 border-t border-border">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          <Button variant="outline" size="lg" onClick={onClose} className="flex-1 cursor-pointer">
            Cancelar
          </Button>
          <Button 
            size="lg" 
            onClick={handleSubmit(onSubmit, onInvalid)} 
            className="flex-1 cursor-pointer bg-(--button-primary-color) hover:bg-(--button-primary-hover-color)"
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdate ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
