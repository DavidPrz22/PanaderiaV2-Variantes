import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";
import { createMateriaPrimaListPKQueryOptions } from "@/features/MateriaPrima/hooks/queries/materiaPrimaQueryOptions";
import { useQueryClient } from "@tanstack/react-query";

import type { TMateriaPrimaList } from "../schemas/zod-types";

import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useDeleteMateriaPrimaMutation } from "../hooks/mutations/materiaPrimaMutations";
import { useState } from "react";
import { toast } from "sonner";

export const TableRow = ({
  item,
  index,
  last
}: {
  item: TMateriaPrimaList;
  index: number;
  last: boolean;
}) => {
  const queryClient = useQueryClient();
  const {
    setShowMateriaprimaDetalles,
    setMateriaprimaId,
    setLotesForm,
    setIsLoadingDetalles,
    setUpdateRegistro,
    setShowMateriaprimaForm
  } = useMateriaPrimaContext();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutateAsync: deleteMateriaPrima, isPending: isDeleting } = useDeleteMateriaPrimaMutation();

  async function setDetails(pk: number) {
    setIsLoadingDetalles(true);
    await queryClient.fetchQuery(
      createMateriaPrimaListPKQueryOptions(pk),
    );
    setShowMateriaprimaDetalles(true);
    setMateriaprimaId(pk);
    setLotesForm([]);
    setIsLoadingDetalles(false);
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMateriaprimaId(item.id);
    setUpdateRegistro(true);
    setShowMateriaprimaForm(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteMateriaPrima(item.id);
    setShowDeleteModal(false);
    toast.success("Materia Prima eliminada exitosamente");
  };

  return (
    <>
      <div
        onClick={() => setDetails(item.id)}
        key={item.id}
        className={`cursor-pointer hover:bg-gray-100 grid grid-cols-[0.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr_0.5fr] justify-between items-center px-8 py-4 ${last ? "rounded-b-md" : "border-b"} border-gray-300 ${index % 2 == 0 ? "bg-white" : "bg-gray-50"} font-[Roboto] text-sm`}
      >
        <div>{item.id}</div>
        <div>{item.nombre}</div>
        <div>{item.unidad_medida_base.nombre_completo}</div>
        <div>{item.categoria.nombre_categoria}</div>
        <div>{item.stock_actual === 0 ? "Sin stock" : item.stock_actual}</div>
        <div>{item.punto_reorden}</div>
        <div>{item.fecha_creacion_registro}</div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
        title={`Eliminar ${item.nombre}`}
      />
    </>
  );
};
