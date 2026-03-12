import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { TMateriaPrimaVariante } from "../../schemas/zod-types";

interface VariantsTableProps {
    variantes: TMateriaPrimaVariante[];
}

export const VariantsTable = ({ variantes }: VariantsTableProps) => {
    console.log(variantes)
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Variantes de Compra
                </h4>
                <Badge variant="outline">{variantes.length}</Badge>
            </div>

            {variantes.length > 0 ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Variante</TableHead>
                                <TableHead>Unidad</TableHead>
                                <TableHead className="text-right">Precio $</TableHead>
                                <TableHead className="text-right">Precio Local</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variantes.map((variante) => (
                                <TableRow key={variante.id}>
                                    <TableCell className="font-medium">
                                        {variante.nombre_variante}
                                        {variante.nombre_empaque_estandar && (
                                            <p className="text-xs text-muted-foreground">
                                                {variante.nombre_empaque_estandar} -{" "}
                                                {variante.cantidad_empaque_estandar}{" "}
                                                {variante.unidad_medida_empaque_estandar?.abreviatura ||
                                                    ""}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>{variante.unidad_compra.abreviatura}</TableCell>
                                    <TableCell className="text-right">
                                        {variante.precio_compra_divisa != null
                                            ? `$${variante.precio_compra_divisa}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {variante.precio_compra_local != null
                                            ? variante.precio_compra_local
                                            : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-4">
                    No hay variantes registradas
                </p>
            )}
        </div>
    );
};
