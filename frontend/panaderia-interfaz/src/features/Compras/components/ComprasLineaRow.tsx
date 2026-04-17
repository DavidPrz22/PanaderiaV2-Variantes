import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DetalleOC, Producto, VarianteProducto } from "../types/types";
import ComprasProductoSelector from "./ComprasProductoSelector";
import { MODO_COMPRA, type ModoCompra } from "../utils/contants";
import { handleProductSelection, updateItemField } from "../utils/itemHandlers";
import { RoundToTwo } from "@/utils/utils";
import { useUnidadesMedidaQuery, useEmpaquetadoProductosQuery } from "@/hooks/useQueryHooks";

interface Props {
  linea: DetalleOC;
  moneda: "USD" | "Bs";
  tasaCambio: number;
  onChange: (linea: DetalleOC) => void;
  onRemove: () => void;
  autoFocus?: boolean;
}

export function CompraLineaRow({ linea, moneda, tasaCambio, onChange, onRemove, autoFocus }: Props) {

  const { data: unidadesMedida } = useUnidadesMedidaQuery();
  const { data: empaquetadoProductos } = useEmpaquetadoProductosQuery();

  const handleSelectProduct = (producto: Producto, variante: VarianteProducto) => {
    const newLinea = handleProductSelection(linea, producto, variante);
    onChange(newLinea);
  };

  const currentProductName = linea.materia_prima_nombre || linea.producto_reventa_nombre;
  const currentProductId = linea.materia_prima || linea.producto_reventa;

  const displaySubtotal = (linea.costo_unitario_usd || 0) * (linea.cantidad_solicitada || 0);
  const displaySubtotalLocal = RoundToTwo(displaySubtotal * (tasaCambio || 1));
  
  const handleCantidadChange = (val: string) => {
    const cantidad = parseFloat(val) || 0;
    const newLinea = updateItemField(linea, "cantidad_solicitada", cantidad);
    onChange(newLinea);
  };
  const handleCostoChange = (val: string) => {
    const costo = parseFloat(val) || 0;
    let costoUsd = costo;

    if (moneda === "Bs") {
      costoUsd = tasaCambio > 0 ? costo / tasaCambio : 0;
    }

    const newLinea = updateItemField(linea, "costo_unitario_usd", costoUsd);
    onChange(newLinea);
  };

  const displayCosto = moneda === "USD"
    ? (linea.costo_unitario_usd || 0)
    : (linea.costo_unitario_usd || 0) * (tasaCambio || 1);

  return (
    <div className="grid grid-cols-12 gap-3 items-center px-3 py-2 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group">
      {/* Product selector - 3 cols */}
      <div className="col-span-3">
        <ComprasProductoSelector
          selectedVarianteId={currentProductId}
          currentName={currentProductName}
          onSelect={handleSelectProduct}
          autoFocus={autoFocus}
        />
      </div>
      {/* Purchase mode - 2 cols */}
      <div className="col-span-2">
        {currentProductId ? (
          <Select
            value={linea.modo_compra || MODO_COMPRA.UNIDAD}
            onValueChange={(v) => { 
              const newModo = v as ModoCompra;
              onChange({ ...linea, modo_compra: newModo });
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Modo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MODO_COMPRA.UNIDAD}>Por unidad</SelectItem>
              <SelectItem value={MODO_COMPRA.CONTENEDOR}>Por contenedor</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-10 flex items-center text-sm text-muted-foreground px-3 border rounded-md border-dashed">
            Selecciona producto
          </div>
        )}
      </div>

      {/* Unit - 2 cols*/}
      <div className="col-span-2">
        {currentProductId && linea.modo_compra === MODO_COMPRA.UNIDAD ? (
          <Select
            value={linea.unidad_medida_compra?.id?.toString() || ""}
            onValueChange={(v) => {
              const unit = unidadesMedida?.find(u => u.id.toString() === v);
              onChange({ ...linea, unidad_medida_compra: unit });
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="unidad..." />
            </SelectTrigger>
            <SelectContent>
              {unidadesMedida?.map(
                (unidad) => (
                  <SelectItem key={unidad.id} value={unidad.id.toString()}>
                    {unidad.abreviatura}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        )

          : currentProductId && linea.modo_compra === MODO_COMPRA.CONTENEDOR ? (
            <Select
              value={linea.empaquetado?.id?.toString() || ""}
              onValueChange={(v) => {
                const empaq = empaquetadoProductos?.find(e => e.id.toString() === v);
                if (empaq) {
                  const unidad = unidadesMedida?.find(u => u.id === empaq.unidad_medida);
                  onChange({ 
                    ...linea, 
                    empaquetado: {
                      id: empaq.id,
                      empaque_nombre: empaq.empaque_nombre,
                      cantidad_por_contenedor: empaq.cantidad_por_contenedor,
                      unidad_medida: unidad!,
                      cantidad_unidad_medida: empaq.cantidad_unidad_medida
                    } 
                  });
                } else {
                  onChange({ ...linea, empaquetado: undefined });
                }
              }}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Empaque..." />
              </SelectTrigger>
              <SelectContent>
                {empaquetadoProductos?.map(
                  (empaquetado) => (
                    <SelectItem key={empaquetado.id} value={empaquetado.id.toString()}>
                      {empaquetado.empaque_nombre}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 flex items-center text-sm text-muted-foreground px-3 border rounded-md border-dashed">
              Selecciona producto
            </div>
          )}
      </div>

      {/* Cantidad - 1 col */}
      <div className="col-span-1">
        <Input
          type="number"
          min={0}
          value={linea.cantidad_solicitada || ""}
          onChange={(e) => handleCantidadChange(e.target.value)}
          className="h-10 text-center"
          placeholder="0"
          disabled={!currentProductId}
        />
      </div>

      {/* Costo unitario - 2 cols */}
      <div className="col-span-2 flex items-center gap-1">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {moneda === "USD" ? "$" : "Bs"}
          </span>
          <Input
            type="number"
            step="0.01"
            value={displayCosto || ""}
            onChange={(e) => handleCostoChange(e.target.value)}
            className="h-10 pl-8"
            placeholder="0.00"
            disabled={!currentProductId}
          />
        </div>
      </div>

      {/* Subtotal - 2 cols */}
      <div className="col-span-2 flex items-center justify-between">
        <div className="flex flex-col items-end gap-0.5 flex-1">
          <span className="text-sm font-semibold text-foreground">
            {moneda === "USD" ? "$" : "Bs "}{(moneda === "USD" ? displaySubtotal : displaySubtotalLocal).toFixed(2)}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-2"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
