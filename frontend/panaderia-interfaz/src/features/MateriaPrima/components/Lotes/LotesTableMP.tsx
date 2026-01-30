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
import { LoteMateriaPrima, proveedoresMock } from "@/types/lotes";
import { unidadesMedida } from "@/types/materiaPrima";

interface LotesTableProps {
  lotes: LoteMateriaPrima[];
  unidadMedidaBase: string;
  onAddLote: () => void;
  onViewLote: (lote: LoteMateriaPrima) => void;
}

const getProveedorNombre = (proveedorId: string) => {
  const proveedor = proveedoresMock.find((p) => p.id === proveedorId);
  return proveedor?.nombre || "";
};

const getUnidadAbreviatura = (unidadId: string) => {
  const unidad = unidadesMedida.find((u) => u.id === unidadId);
  return unidad?.abreviatura || "";
};

const getStatusBadgeVariant = (estado: string) => {
  switch (estado) {
    case "Disponible":
      return "default";
    case "Inactivo":
      return "secondary";
    case "Agotado":
      return "outline";
    case "Expirado":
      return "destructive";
    default:
      return "secondary";
  }
};

export const LotesTable = ({
  lotes,
  unidadMedidaBase,
  onAddLote,
  onViewLote,
}: LotesTableProps) => {
  const unidadBase = getUnidadAbreviatura(unidadMedidaBase);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Lotes
        </h4>
        <Button size="sm" onClick={onAddLote}>
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
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewLote(lote)}
                >
                  <TableCell className="font-medium">
                    {getProveedorNombre(lote.proveedorId)}
                  </TableCell>
                  <TableCell>{lote.fechaRecepcion}</TableCell>
                  <TableCell>{lote.fechaCaducidad}</TableCell>
                  <TableCell className="text-right">
                    {lote.cantidadRecibida} {unidadBase}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        lote.stockActualLote === 0
                          ? "text-muted-foreground"
                          : ""
                      }
                    >
                      {lote.stockActualLote} {unidadBase}
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
