import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VariantesProductosReventa } from "../types/types";

interface ProductosReventaVariantesTableProps {
  variantes: VariantesProductosReventa[];
}

export function ProductosReventaVariantesTable({ variantes }: ProductosReventaVariantesTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden font-[Roboto]">
      <Table>
        <TableHeader className="bg-gray-100 uppercase text-[10px] font-bold">
          <TableRow>
            <TableHead className="px-4 py-3 text-gray-700">Nombre</TableHead>
            <TableHead className="px-4 py-3 text-gray-700 font-medium">Atributo</TableHead>
            <TableHead className="px-4 py-3 text-gray-700 font-medium">Precio (USD)</TableHead>
            <TableHead className="px-4 py-3 text-gray-700 text-right">Stock</TableHead>
            <TableHead className="px-4 py-3 text-gray-700 text-right">Punto Reorden</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variantes.map((variante) => (
            <TableRow key={variante.id} className="hover:bg-gray-50 transition-colors bg-white">
              <TableCell className="px-4 py-3 font-medium">
                {variante.nombre_variante}
                {variante.SKU && <p className="text-[10px] text-gray-500 font-normal">SKU: {variante.SKU}</p>}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-600">{variante.atributo}</TableCell>
              <TableCell className="px-4 py-3 text-gray-900 font-medium">${variante.precio_venta_divisa}</TableCell>
              <TableCell className={`px-4 py-3 text-right font-medium ${variante.stock_actual <= variante.punto_reorden ? "text-red-600" : "text-gray-900"}`}>
                {variante.stock_actual}
              </TableCell>
              <TableCell className="px-4 py-3 text-right text-gray-500 font-medium">{variante.punto_reorden}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
