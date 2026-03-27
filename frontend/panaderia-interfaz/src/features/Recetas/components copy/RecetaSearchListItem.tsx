import { toast } from "sonner";
import type {
  componenteListadosReceta,
  itemRecetasSearchList,
  watchSetValueProps,
} from "../types/types";
import { useRecetasContext } from "@/context/RecetasContext";

export default function RecetaSearchListItem({
  nombre,
  id,
  tipo,
  unidad_medida,
  watch,
  setValue
}: itemRecetasSearchList & watchSetValueProps) {
  const { setComponentesListadosReceta, componentesListadosReceta } =
    useRecetasContext();

  const handleClick = () => {
    const componente: componenteListadosReceta = {
      id_componente: id,
      componente_tipo: tipo,
      nombre: nombre,
      unidad_medida: unidad_medida,
      cantidad: 0,
    };

    // Create the component data for the form
    let componenteReceta;
    if (tipo === "MateriaPrima") {
      componenteReceta = {
        componente_id: id,
        materia_prima: true,
        cantidad: 0
      };
    } else {
      componenteReceta = {
        componente_id: id,
        producto_intermedio: true,
        cantidad: 0
      };
    }

    const currentFormData = watch("componente_receta") || [];
    // Check if component already exists in context (for display)
    if (
      componentesListadosReceta.find(
        (componente) => componente.id_componente === id,
      ) ||
      currentFormData.find((item) => item.componente_id === id)
    ) {
      return;
    }

    // Update context for display
    setComponentesListadosReceta([...componentesListadosReceta, componente]);

    // Update form field
    setValue("componente_receta", [...currentFormData, componenteReceta]);

    toast.success("Componente agregado a la receta");
  };

  return (
    <li
      data-tipo={tipo}
      id={id.toString()}
      className={`py-2 px-6 border-b border-gray-300 hover:bg-gray-100 cursor-pointer `}
      onClick={() => handleClick()}
    >
      {nombre}
    </li>
  );
}
