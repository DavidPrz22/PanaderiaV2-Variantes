import { BorrarIcon } from "@/assets/DashboardAssets";
import { TubeSpinner } from "@/assets";
import Button from "@/components/Button";
import Title from "@/components/Title";

export const DeleteComponent = ({
  deleteFunction,
  cancelFunction,
  isLoading,
  title,
  buttonText,
}: {
  deleteFunction: () => Promise<void>;
  cancelFunction: () => void;
  isLoading: boolean;
  title: string;
  buttonText: string;
}) => {
  const handleDelete = async () => {
    await deleteFunction();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-[rgba(0,0,0,0.5)] z-150">
      <div className="flex flex-col gap-5 w-[500px] bg-white rounded-lg shadow-md  p-5">
        <div className="flex flex-col gap-5 justify-between items-center">
          <Title extraClass="text-center">{title}</Title>
          <div className="flex justify-between gap-2">
            <Button
              type="cancel"
              onClick={() => {
                cancelFunction();
              }}
            >
              <div className="flex items-center gap-2">Cancelar</div>
            </Button>
            <Button type="delete" onClick={handleDelete}>
              <div className="flex items-center gap-2">
                {buttonText}
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
