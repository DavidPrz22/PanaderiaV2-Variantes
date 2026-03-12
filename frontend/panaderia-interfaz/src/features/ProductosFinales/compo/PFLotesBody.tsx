import type { LotesProductosFinales } from "../types/types";
import { useState } from "react";
import { PendingTubeSpinner } from "./PendingTubeSpinner";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";
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
import { useDeleteLoteProductoElaboradoMutation } from "../hooks/mutations/productosFinalesMutations";


export const PFLotesBody = ({ data, isLoading }: { data: LotesProductosFinales[], isLoading: boolean }) => {

    const { setShowLotesDetalles, setLotesProductosFinalesDetalles, productoId } = useProductosFinalesContext();
    const { user } = useAuth();
    const canDelete = user ? userHasPermission(user, "lots", "delete") : false;
    const [lotToDelete, setLotToDelete] = useState<number | null>(null);
    const mutation = useDeleteLoteProductoElaboradoMutation(productoId || undefined, () => setLotToDelete(null));

    const handleOnClick = (item: LotesProductosFinales) => {
        setShowLotesDetalles(true);
        setLotesProductosFinalesDetalles(item);
    }
    const content = () => {
        if (isLoading) {
            return (
                <div className="rounded-b-lg">
                    <PendingTubeSpinner
                        size={28}
                        extraClass="bg-white opacity-50 w-full h-full"
                    />
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="rounded-b-lg">
                    <div className="p-4 grid grid-cols-7 border-t border-gray-300">
                        <div className="col-span-7 text-center text-gray-500">No hay datos</div>
                    </div>
                </div>
            );
        }

        return (
            <div className="rounded-b-lg">
                {data.map((item) => (
                    <div
                        key={item.id}
                        className={`p-4 grid grid-cols-7 border-t border-gray-300 hover:bg-gray-100 cursor-pointer font-[Roboto] text-sm items-center`}
                        onClick={() => handleOnClick(item)}
                    >
                        <div>{item.cantidad_inicial_lote}</div>
                        <div>{item.stock_actual_lote}</div>
                        <div>{item.fecha_caducidad}</div>
                        <div>{item.fecha_produccion}</div>
                        <div>{item.coste_total_lote_usd}</div>
                        <div className="font-medium">{item.estado}</div>
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
        );
    };

    return (
        <>
            {content()}
            <AlertDialog open={!!lotToDelete} onOpenChange={(open) => !open && setLotToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro de eliminar este lote?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el lote y actualizará el stock disponible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
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