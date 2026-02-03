import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { TLoteMateriaPrima } from "../../schemas/zod-types";
import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";
import { useMateriaPrimaDetallesQuery } from "../../hooks/queries/materiaPrimaqueries";

interface LotesTableProps {
    lotes: TLoteMateriaPrima[];
    onAddLote: () => void;
    onViewLote: (lote: TLoteMateriaPrima) => void;
}
import { getStatusBadgeVariant } from "@/utils/utils";

export const LotesTable = ({
    lotes,
    onAddLote,
    onViewLote,
}: LotesTableProps) => {

    const { materiaprimaId } = useMateriaPrimaContext();
    const { data: materiaprimaDetalles } = useMateriaPrimaDetallesQuery(materiaprimaId!);

    const unidadAbrev = materiaprimaDetalles?.unidad_medida_base?.abreviatura;
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Lotes
                </h4>
                <Button size="lg" onClick={onAddLote} className=" bg-(--button-primary-color) hover:bg-(--button-primary-hover-color) cursor-pointer">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Lote
                </Button>
            </div>

            {lotes.length > 0 ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Recepción</TableHead>
                                <TableHead>Caducidad</TableHead>
                                <TableHead className="text-right">Recibido</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lotes.map((lote) => (
                                <TableRow
                                    key={lote.id}
                                    className="cursor-pointer hover:bg-muted/50 h-12"
                                    onClick={() => onViewLote(lote)}
                                >
                                    <TableCell className="font-medium">
                                        {lote.proveedor.nombre_comercial || `${lote.proveedor.nombre_proveedor} ${lote.proveedor.apellido_proveedor}`}
                                    </TableCell>
                                    <TableCell>{lote.fecha_recepcion.toString()}</TableCell>
                                    <TableCell>{lote.fecha_caducidad.toString()}</TableCell>
                                    <TableCell className="text-right">
                                        {lote.cantidad_recibida} {unidadAbrev}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span
                                            className={
                                                lote.stock_actual_lote === 0
                                                    ? "text-muted-foreground"
                                                    : ""
                                            }
                                        >
                                            {lote.stock_actual_lote} {unidadAbrev}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(lote.estado)}>
                                            {lote.estado}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    No hay lotes registrados para esta materia prima
                </div>
            )}
        </div>
    );
};
