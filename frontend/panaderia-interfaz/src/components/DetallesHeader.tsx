import Title from "@/components/Title";
import Button from "@/components/Button";
import { EditarIcon, BorrarIcon} from "@/assets/DashboardAssets";
import { ArrowLeft } from "lucide-react";
import { Button as ButtonUI } from "./ui/button";

interface DetallesHeaderProps {
  title?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

export const DetallesHeader = ({
  title,
  onEdit,
  onDelete,
  onClose,
}: DetallesHeaderProps) => {
  return (
    <div className="flex justify-between items-center font-[Roboto] border-b border-gray-200">
      <div className="flex justify-between items-center w-4xl max-w-4xl mx-auto pb-6">
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <ButtonUI onClick={onClose} variant="ghost" className="cursor-pointer">
                <ArrowLeft className="size-5"/>
              </ButtonUI>
              <Title >{title}</Title>
            </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button type="edit" onClick={onEdit}>
              <div className="flex items-center gap-2">
                Editar
                <img src={EditarIcon} alt="Editar" />
              </div>
            </Button>
          )}
          {onDelete && (
            <Button type="delete" onClick={onDelete}>
              <div className="flex items-center gap-2">
                Eliminar
                <img src={BorrarIcon} alt="Eliminar" />
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
