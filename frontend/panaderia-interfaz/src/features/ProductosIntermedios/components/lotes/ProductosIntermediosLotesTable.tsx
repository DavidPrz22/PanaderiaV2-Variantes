import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetLotesProductosIntermedios } from "../../hooks/queries/queries";
import type { LoteProductoIntermedio } from "../../types/types";
import { usePageHook } from "@/hooks/usePageHook";
import { Paginator } from "@/components/Paginator";
import { getStatusBadgeVariant } from "@/utils/utils";
import { PendingTubeSpinner } from "@/components/PendingTubeSpinner";

interface LotesProductoIntermedioTableProps {
  productoId: number
  onViewLote: (lote: LoteProductoIntermedio) => void;
}

export const LotesProductoIntermedioTable = ({
  productoId,
  onViewLote,
}: LotesProductoIntermedioTableProps) => {


  const {
          data: lotesPagination,
          isFetching: isFetchingLotesProductosIntermedios,
          fetchNextPage,
          hasNextPage,
  } = useGetLotesProductosIntermedios(productoId);
  
const { 
        page, 
        setPage, 
        currentPageResults: lotesPage, 
        totalPages: pages_count 
  } = usePageHook(lotesPagination, fetchNextPage, hasNextPage);

  // Sort by expiration date (nearest first)
  const sortedLotes = [...lotesPage].sort((a, b) => 
    new Date(a.fecha_caducidad).getTime() - new Date(b.fecha_caducidad).getTime()
  );

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        Lotes
      </h4>

      {isFetchingLotesProductosIntermedios ? <PendingTubeSpinner size={20}/> :
        lotesPage.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producción</TableHead>
                  <TableHead>Fecha Prod.</TableHead>
                  <TableHead>Caducidad</TableHead>
                  <TableHead className="text-right">Inicial</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Costo ($)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLotes.map((lote) => (
                  <TableRow
                    key={lote.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewLote(lote)}
                  >
                    <TableCell className="font-medium">
                      {lote.produccion_origen}
                    </TableCell>
                    <TableCell>{lote.fecha_produccion}</TableCell>
                    <TableCell>{lote.fecha_caducidad}</TableCell>
                    <TableCell className="text-right">
                      {lote.cantidad_inicial_lote}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          lote.stock_actual_lote === 0
                            ? "text-muted-foreground"
                            : ""
                        }
                      >
                        {lote.stock_actual_lote}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      ${lote.coste_total_lote_usd.toFixed(2)}
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
            No hay lotes registrados para este producto
          </div>
        )
      }

      <Paginator
        previousPage={page > 0}
        nextPage={hasNextPage || page < pages_count - 1}
        pages={Array.from({ length: pages_count }, (_, i) => i)}
        currentPage={page}
        onClickPrev={() => setPage({ type: "previous" })}
        onClickPage={(p) => setPage({ type: "base", payload: p })}
        onClickNext={() => setPage({ type: "next" })}
      />
    </div>
  );
};
