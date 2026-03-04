import { BorrarIcon } from "@/assets/DashboardAssets";
import { DetailFieldValue } from "@/components/DetailFieldValue";
import type { RecetaRelacionada } from "../types/types";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";

export const RecetaFieldValue = ({
  recetaRelacionada,
}: {
  recetaRelacionada: RecetaRelacionada;
}) => {
  const { user } = useAuth();
  const userCanEdit = userHasPermission(user!, 'productos_elaborados', 'edit');
  const { setDeleteRecetaRelacionada, setShowRecipeModal, setSelectedRecipeId } = useProductosIntermediosContext();

  const HandleRemoveReceta = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteRecetaRelacionada(true);
  };

  const handleRecipeClick = () => {
    if (recetaRelacionada) {
      setSelectedRecipeId(recetaRelacionada.id);
      setShowRecipeModal(true);
    }
  };

  return (
    <DetailFieldValue extraClass="min-h-[25px] flex items-center">
      {recetaRelacionada !== false ? (
        <div className="flex items-center gap-2 w-full">
          <span
            onClick={handleRecipeClick}
            className="cursor-pointer hover:underline text-blue-600 font-medium transition-colors"
          >
            {recetaRelacionada?.nombre}
          </span>
          {userCanEdit && (
            <button
              onClick={HandleRemoveReceta}
              className="bg-red-500 text-white p-1 rounded-md hover:bg-red-600 cursor-pointer ml-auto"
            >
              <img src={BorrarIcon} alt="Eliminar" className="size-4" />
            </button>
          )}
        </div>
      ) : (
        "No hay receta relacionada"
      )}
    </DetailFieldValue>
  );
};
