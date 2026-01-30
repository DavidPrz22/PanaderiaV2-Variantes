import { useState, useMemo } from "react";
import { ArrowLeft, Package, Calendar, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MateriaPrima,
  unidadesMedida,
  categoriasMateriaPrima,
} from "@/types/materiaPrima";
import { LoteMateriaPrima, lotesMateriasPrimasMock } from "@/types/lotes";
import { LotesTable } from "./LotesTable";
import { LoteForm, LoteFormData } from "./LoteForm";
import { LoteDetailsPanel } from "./LoteDetailsPanel";
import { toast } from "sonner";

type DetailsViewMode = "details" | "loteForm" | "loteDetails";

interface MateriaPrimaDetailsPanelProps {
  materiaPrima: MateriaPrima | null;
  onClose: () => void;
  fullScreen?: boolean;
}

const getUnidadNombre = (unidadId: string) => {
  const unidad = unidadesMedida.find((u) => u.id === unidadId);
  return unidad ? `${unidad.nombre} (${unidad.abreviatura})` : "";
};

const getUnidadAbreviatura = (unidadId: string) => {
  const unidad = unidadesMedida.find((u) => u.id === unidadId);
  return unidad?.abreviatura || "";
};

const getCategoriaNombre = (categoriaId: string) => {
  const categoria = categoriasMateriaPrima.find((c) => c.id === categoriaId);
  return categoria?.nombre || "";
};

export const MateriaPrimaDetailsPanel = ({
  materiaPrima,
  onClose,
  fullScreen = false,
}: MateriaPrimaDetailsPanelProps) => {
  const [viewMode, setViewMode] = useState<DetailsViewMode>("details");
  const [lotes, setLotes] = useState<LoteMateriaPrima[]>(lotesMateriasPrimasMock);
  const [selectedLote, setSelectedLote] = useState<LoteMateriaPrima | null>(null);
  const [editingLote, setEditingLote] = useState<LoteMateriaPrima | null>(null);

  const materiaPrimaLotes = useMemo(() => {
    if (!materiaPrima) return [];
    return lotes.filter((l) => l.materiaPrimaId === materiaPrima.id);
  }, [lotes, materiaPrima]);

  if (!materiaPrima) return null;

  const isLowStock = materiaPrima.stockActual <= materiaPrima.puntoReorden;

  const handleAddLote = () => {
    setEditingLote(null);
    setViewMode("loteForm");
  };

  const handleViewLote = (lote: LoteMateriaPrima) => {
    setSelectedLote(lote);
    setViewMode("loteDetails");
  };

  const handleEditLote = () => {
    setEditingLote(selectedLote);
    setViewMode("loteForm");
  };

  const handleDeleteLote = () => {
    if (!selectedLote) return;
    
    setLotes((prev) => prev.filter((l) => l.id !== selectedLote.id));
    toast.success("Lote eliminado correctamente");
    setSelectedLote(null);
    setViewMode("details");
  };

  const handleSaveLote = (data: LoteFormData) => {
    if (editingLote) {
      // Update existing lote
      setLotes((prev) =>
        prev.map((l) =>
          l.id === editingLote.id
            ? {
                ...l,
                proveedorId: data.proveedorId,
                varianteId: data.varianteId || null,
                fechaRecepcion: data.fechaRecepcion?.toISOString().split("T")[0] || "",
                fechaCaducidad: data.fechaCaducidad?.toISOString().split("T")[0] || "",
                cantidadRecibida: parseFloat(data.cantidadRecibida) || 0,
                stockActualLote: parseFloat(data.cantidadRecibida) || 0,
                costoUnitarioDivisa: parseFloat(data.costoUnitarioDivisa) || 0,
                costoUnitarioLocal: parseFloat(data.costoUnitarioLocal) || 0,
              }
            : l
        )
      );
      toast.success("Lote actualizado correctamente");
    } else {
      // Create new lote
      const newLote: LoteMateriaPrima = {
        id: crypto.randomUUID(),
        materiaPrimaId: materiaPrima.id,
        varianteId: data.varianteId || null,
        proveedorId: data.proveedorId,
        fechaRecepcion: data.fechaRecepcion?.toISOString().split("T")[0] || "",
        fechaCaducidad: data.fechaCaducidad?.toISOString().split("T")[0] || "",
        cantidadRecibida: parseFloat(data.cantidadRecibida) || 0,
        stockActualLote: parseFloat(data.cantidadRecibida) || 0,
        costoUnitarioDivisa: parseFloat(data.costoUnitarioDivisa) || 0,
        costoUnitarioLocal: parseFloat(data.costoUnitarioLocal) || 0,
        estado: "Disponible",
        activo: true,
      };
      setLotes((prev) => [...prev, newLote]);
      toast.success("Lote creado correctamente");
    }
    setEditingLote(null);
    setViewMode("details");
  };

  const handleBackFromLote = () => {
    setEditingLote(null);
    setSelectedLote(null);
    setViewMode("details");
  };

  // Lote Form View
  if (viewMode === "loteForm") {
    return (
      <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background`}>
        <LoteForm
          materiaPrima={materiaPrima}
          lote={editingLote}
          onClose={handleBackFromLote}
          onSave={handleSaveLote}
        />
      </div>
    );
  }

  // Lote Details View
  if (viewMode === "loteDetails" && selectedLote) {
    return (
      <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background`}>
        <LoteDetailsPanel
          lote={selectedLote}
          materiaPrima={materiaPrima}
          onClose={handleBackFromLote}
          onEdit={handleEditLote}
          onDelete={handleDeleteLote}
        />
      </div>
    );
  }

  // Main Details View
  return (
    <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Detalles de Materia Prima</h2>
            <p className="text-sm text-muted-foreground">
              Información completa del registro
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">{materiaPrima.nombre}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {getCategoriaNombre(materiaPrima.categoria)}
              </Badge>
              {isLowStock && (
                <Badge variant="destructive">Stock Bajo</Badge>
              )}
            </div>
            {materiaPrima.descripcion && (
              <p className="text-muted-foreground mt-2">
                {materiaPrima.descripcion}
              </p>
            )}
          </div>

          <Separator />

          {/* Stock Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Información de Stock
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Stock Actual</p>
                <p className={`text-3xl font-bold ${isLowStock ? "text-destructive" : ""}`}>
                  {materiaPrima.stockActual}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    {getUnidadAbreviatura(materiaPrima.unidadMedidaBase)}
                  </span>
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Punto Reorden</p>
                <p className="text-3xl font-bold">
                  {materiaPrima.puntoReorden}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    {getUnidadAbreviatura(materiaPrima.unidadMedidaBase)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details Table */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Detalles Generales
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Unidad Base</span>
                <span className="font-medium">
                  {getUnidadNombre(materiaPrima.unidadMedidaBase)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Categoría</span>
                <span className="font-medium">
                  {getCategoriaNombre(materiaPrima.categoria)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b items-center">
                <span className="text-muted-foreground">Fecha Registro</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {materiaPrima.fechaCreacionRegistro}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Variantes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Variantes de Compra
              </h4>
              <Badge variant="outline">{materiaPrima.variantes.length}</Badge>
            </div>

            {materiaPrima.variantes.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variante</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead className="text-right">Precio $</TableHead>
                      <TableHead className="text-right">Precio Local</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materiaPrima.variantes.map((variante) => (
                      <TableRow key={variante.id}>
                        <TableCell className="font-medium">
                          {variante.nombreVariante}
                          {variante.nombreEmpaqueEstandar && (
                            <p className="text-xs text-muted-foreground">
                              {variante.nombreEmpaqueEstandar} - {variante.cantidadEmpaqueEstandar}{" "}
                              {getUnidadAbreviatura(variante.unidadMedidaEmpaqueEstandar || "")}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {getUnidadAbreviatura(variante.unidadCompra)}
                        </TableCell>
                        <TableCell className="text-right">
                          {variante.precioCompraDivisa != null
                            ? `$${variante.precioCompraDivisa.toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {variante.precioCompraLocal != null
                            ? variante.precioCompraLocal.toFixed(2)
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

          <Separator />

          {/* Lotes */}
          <LotesTable
            lotes={materiaPrimaLotes}
            unidadMedidaBase={materiaPrima.unidadMedidaBase}
            onAddLote={handleAddLote}
            onViewLote={handleViewLote}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
