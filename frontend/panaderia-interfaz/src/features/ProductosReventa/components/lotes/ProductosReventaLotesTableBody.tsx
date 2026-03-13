import type { LotesProductosReventa } from "../../types/types";
import { useState } from "react";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/features/Authentication/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteLoteProductosReventaMutation } from "../../hooks/mutations/productosReventaMutations";
import { PendingTubeSpinner } from "../PendingTubeSpinner";

export const ProductosReventaLotesTableBody = ({
  data,
  isLoading,
}: {
  data: LotesProductosReventa[];
  isLoading: boolean;
}) => {
  const {
    setLotesProductosReventaDetalles,
    setShowPRLotesDetalles,
    productoReventaId,
  } = useProductosReventaContext();
  const { user } = useAuth();
  const canDelete = user ? userHasPermission(user, "lots", "delete") : false;
  const [lotToDelete, setLotToDelete] = useState<number | null>(null);
  const mutation = useDeleteLoteProductosReventaMutation(
    productoReventaId || undefined,
    () => setLotToDelete(null)
  );

  const handleRowClick = (item: LotesProductosReventa) => {
    setShowPRLotesDetalles(true);
    setLotesProductosReventaDetalles(item);
  };

  if (isLoading) {
    return (
      <div className="relative h-24">
        <PendingTubeSpinner
          size={28}
          extraClass="bg-white opacity-50 w-full h-full"
        />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 border-t border-gray-300">
        No hay lotes registrados
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    if (a.estado === "DISPONIBLE" && b.estado !== "DISPONIBLE") return -1;
    if (a.estado !== "DISPONIBLE" && b.estado === "DISPONIBLE") return 1;
    return (
      new Date(a.fecha_caducidad).getTime() -
      new Date(b.fecha_caducidad).getTime()
    );
  });

  return (
    <>
      <div className="divide-y divide-gray-200">
        {sortedData.map((item) => (
          <div
            key={item.id}
            onClick={() => handleRowClick(item)}
            className="p-4 grid grid-cols-7 border-t border-gray-300 hover:bg-gray-50 cursor-pointer font-[Roboto] text-sm items-center transition-colors"
          >
            <div>{item.cantidad_recibida}</div>
            <div>{item.stock_actual_lote}</div>
            <div>{item.fecha_caducidad}</div>
            <div>{item.fecha_recepcion}</div>
            <div>${item.coste_unitario_lote_usd}</div>
            <div className="font-medium">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  item.estado === "DISPONIBLE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.estado}
              </span>
            </div>
            {canDelete && (
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLotToDelete(item.id);
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!lotToDelete}
        onOpenChange={(open) => !open && setLotToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este lote?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el
              lote y actualizará el stock disponible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 font-semibold"
              onClick={async (e) => {
                e.preventDefault();
                if (lotToDelete) await mutation.mutateAsync(lotToDelete);
              }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
