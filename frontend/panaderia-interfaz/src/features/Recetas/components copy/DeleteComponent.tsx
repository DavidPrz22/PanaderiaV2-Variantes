import { useRecetasContext } from "@/context/RecetasContext";
import { BorrarIcon } from "@/assets/DashboardAssets";
import { TubeSpinner } from "@/assets";

import Title from "@/components/Title";
import Button from "../../../components/Button";

export const DeleteComponent = ({
  deleteFunction,
  isLoading,
}: {
  deleteFunction: () => Promise<void>;
  isLoading: boolean;
}) => {
  const { setRegistroDelete, setShowRecetasDetalles, setRecetaId } =
    useRecetasContext();

  const handleDelete = async () => {
    await deleteFunction();
    setRegistroDelete(false);
    setShowRecetasDetalles(false);
    setRecetaId(null);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-[rgba(0,0,0,0.5)] z-150">
      <div className="flex flex-col gap-5 w-[500px] bg-white rounded-lg shadow-md  p-5">
        <div className="flex flex-col gap-5 justify-between items-center">
          <Title>Seguro que desea eliminar este registro?</Title>
          <div className="flex justify-between gap-2">
            <Button
              type="cancel"
              onClick={() => {
                setRegistroDelete(null);
              }}
            >
              <div className="flex items-center gap-2">Cancelar</div>
            </Button>
            <Button type="delete" onClick={handleDelete}>
              <div className="flex items-center gap-2">
                Eliminar
                <img src={BorrarIcon} alt="Eliminar" />
              </div>
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-10 w-full gap-2">
              <img src={TubeSpinner} alt="Cargando..." className="size-10" />
              <span className="text-sm">Eliminando...</span>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};
