import { Trash2 } from "lucide-react";
import { FormInput, FormSelect } from "@/components/shared";
import { Button } from "@/components/ui/button";
import type { DetalleOC, Producto, VarianteProducto, UnidadMedida } from "../types/types";
import ComprasProductoSelector from "./ComprasProductoSelector";
import { MODO_COMPRA, type ModoCompra } from "../utils/contants";
import { handleProductSelection, updateItemField } from "../utils/itemHandlers";
import { RoundToTwo } from "@/utils/utils";
import { useUnidadesMedidaQuery, useEmpaquetadoProductosQuery } from "@/hooks/useQueryHooks";
import { useMemo, useState } from "react";

interface Props {
  linea: DetalleOC;
  tasaCambio: number;
  onChange: (linea: DetalleOC) => void;
  onRemove: () => void;
  autoFocus?: boolean;
}

export function CompraLineaRow({ linea, tasaCambio, onChange, onRemove, autoFocus }: Props) {

  // Optimized state: only store the base unit details needed for filtering
  const [baseUnit, setBaseUnit] = useState<UnidadMedida | null>(null);
  const [costoUnitarioUSD, setCostoUnitarioUSD] = useState<number>(linea.costo_unitario_usd || 0);
  const { data: unidadesMedida } = useUnidadesMedidaQuery();
  const { data: empaquetadoProductos } = useEmpaquetadoProductosQuery();

  // Derived measurement type: prioritized current selection, falls back to unit lookup
  const currentUnitIdValue = useMemo(() => {
    const id = typeof linea.unidad_medida_compra === 'object'
      ? linea.unidad_medida_compra?.id
      : linea.unidad_medida_compra;
    return id?.toString() || "";
  }, [linea.unidad_medida_compra]);

  const currentEmpaquIdValue = useMemo(() => {
    const id = typeof linea.empaquetado === 'object'
      ? linea.empaquetado?.id
      : linea.empaquetado;
    return id?.toString() || "";
  }, [linea.empaquetado]);

  const tipoMedida = useMemo(() => {
    if (baseUnit) return baseUnit.tipo_medida;

    const unitId = typeof linea.unidad_medida_compra === 'object'
      ? linea.unidad_medida_compra?.id
      : linea.unidad_medida_compra;

    if (!unitId) return null;

    return unidadesMedida?.find(u => u.id === Number(unitId))?.tipo_medida || null;
  }, [baseUnit, unidadesMedida, linea.unidad_medida_compra]);

  const handleSelectProduct = (producto: Producto, variante: VarianteProducto) => {
    setBaseUnit(producto.unidad_medida_base);
    setCostoUnitarioUSD(variante.precio_compra_divisa);
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
    let costoUsd = RoundToTwo(costo);
    let costoBs = RoundToTwo(costo * tasaCambio);
    setCostoUnitarioUSD(costoUsd);
    const newLineausd = updateItemField(linea, "costo_unitario_usd", costoUsd);
    const newLinea = updateItemField(newLineausd, "costo_unitario_ves", costoBs);
    onChange(newLinea);
  };


  const unidadesMedidaFiltradas = useMemo(() => {
    return unidadesMedida?.filter(u => u.tipo_medida === tipoMedida) || [];
  }, [unidadesMedida, tipoMedida]);


  const empaquetadoProductosFiltrados = useMemo(() => {
    return empaquetadoProductos?.filter(e => e.unidad_medida.tipo_medida === tipoMedida) || [];
  }, [empaquetadoProductos, tipoMedida]);

  const modoOptions = [
    { value: MODO_COMPRA.UNIDAD, label: "Por unidad" },
    { value: MODO_COMPRA.CONTENEDOR, label: "Por contenedor" },
  ];

  const unidadOptions = unidadesMedidaFiltradas.map((unidad) => ({
    value: unidad.id.toString(),
    label: unidad.abreviatura,
  }));

  const empaquetadoOptions = empaquetadoProductosFiltrados.map((e) => ({
    value: e.id,
    label: e.empaque_nombre,
  }));

  return (
    <div className="grid grid-cols-13 gap-3 items-center px-3 py-2 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group">
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
          <FormSelect
            value={linea.modo_compra || MODO_COMPRA.UNIDAD}
            onValueChange={(v) => {
              const newModo = v as ModoCompra;
              onChange({ ...linea, modo_compra: newModo});
            }}
            options={modoOptions}
            triggerClassName="w-full"
            placeholder="Modo..."
          />
        ) : (
          <div className="h-10 flex items-center text-sm text-muted-foreground px-3 border rounded-md border-dashed">
            Selecciona producto
          </div>
        )}
      </div>

      {/* Unit - 2 cols*/}
      <div className="col-span-2">
        {currentProductId && linea.modo_compra === MODO_COMPRA.UNIDAD ? (
          <FormSelect
            value={currentUnitIdValue}
            onValueChange={(v) => {
              const unit = unidadesMedida?.find(u => u.id.toString() === v);
              onChange({ ...linea, unidad_medida_compra: unit });
            }}
            options={unidadOptions}
            triggerClassName="w-full"
            placeholder="unidad..."
          />
        )
          : currentProductId && linea.modo_compra === MODO_COMPRA.CONTENEDOR ? (
            <FormSelect
              value={currentEmpaquIdValue}
              onValueChange={(v) => {
                const empaq = empaquetadoProductos?.find(e => e.id.toString() === v);
                if (empaq) {
                  onChange({
                    ...linea,
                    empaquetado: {
                      id: empaq.id,
                      empaque_nombre: empaq.empaque_nombre,
                      cantidad_por_contenedor: empaq.cantidad_por_contenedor,
                      unidad_medida: empaq.unidad_medida,
                      cantidad_unidad_medida: empaq.cantidad_unidad_medida
                    }
                  });
                }
              }}
              options={empaquetadoOptions}
              triggerClassName="w-full"
              placeholder="Empaque..."
            />
          ) : (
            <div className="h-10 flex items-center text-sm text-muted-foreground px-3 border rounded-md border-dashed">
              Selecciona producto
            </div>
          )}
      </div>

      {/* Cantidad - 2 col */}
      <div className="col-span-2">
        <FormInput
          type="number"
          min={0}
          value={linea.cantidad_solicitada || ""}
          onChange={(e) => handleCantidadChange(e.target.value)}
          className="h-10 text-center w-full"
          placeholder="0"
          disabled={!currentProductId}
        />
      </div>

      {/* Costo unitario - 2 cols */}
      <div className="col-span-2 flex items-center gap-1">
        <FormInput
          type="number"
          step="0.01"
          value={costoUnitarioUSD || ""}
          onChange={(e) => handleCostoChange(e.target.value)}
          className="h-10 pl-8 w-full"
          placeholder="0.00"
          containerClassName="w-full"
          disabled={!currentProductId}
        />
      </div>

      {/* Subtotal - 2 cols */}
      <div className="col-span-2 flex items-center justify-between">
        <div className="flex flex-col items-end gap-0.5 flex-1 ml-4">
          <div className="flex w-full items-center gap-3">
            <span className="text-sm font-semibold text-foreground">
              USD:
            </span>
            <span className="text-sm text-foreground">
              {displaySubtotal}
            </span>
          </div>
          <div className="flex w-full items-center gap-3">
            <span className="text-sm font-semibold text-foreground">
              VES:
            </span>
            <span className="text-sm text-foreground">
              {displaySubtotalLocal}
            </span>
          </div>
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
