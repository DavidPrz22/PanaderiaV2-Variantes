import { useCallback } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { DetalleOC } from "../types/types";
import type { TOrdenCompraSchema } from "../schemas/schemas";
import { MODO_COMPRA } from "../utils/contants";

interface UseComprasFormLogicProps {
  setValue: UseFormSetValue<TOrdenCompraSchema>;
  watch: UseFormWatch<TOrdenCompraSchema>;
}

export const useComprasFormLogic = ({
  setValue,
  watch,
}: UseComprasFormLogicProps) => {

  const roundTo3 = useCallback((n: number) => Math.round(n * 1000) / 1000, []);

  const calculateTotalFromItems = useCallback(
    (itemsArray: DetalleOC[]) => {
      const subtotal = itemsArray.reduce(
        (sum, item) => sum + item.costo_unitario_usd * item.cantidad_solicitada,
        0,
      );

      const tasaCambio = Number(watch("tasa_cambio_aplicada")) || 0;

      setValue("monto_total_oc_usd", roundTo3(subtotal));
      setValue("monto_total_oc_ves", roundTo3(subtotal * tasaCambio));
    },
    [setValue, watch, roundTo3],
  );

  const prepareDataForSubmit = useCallback(
    (data: TOrdenCompraSchema): TOrdenCompraSchema => {
      const tasaCambio = Number(watch("tasa_cambio_aplicada")) || 1;
      
      const details = data.detalles.map((item: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { materia_prima_nombre, producto_reventa_nombre, ...rest } = item;
        
        // Ensure we only send valid unit/empaquetado based on modo_compra
        const unitId = rest.modo_compra === MODO_COMPRA.UNIDAD 
          ? (typeof rest.unidad_medida_compra === "object" ? rest.unidad_medida_compra?.id : rest.unidad_medida_compra)
          : null;
          
        const empaquetadoId = rest.modo_compra === MODO_COMPRA.CONTENEDOR
          ? (typeof rest.empaquetado === "object" ? rest.empaquetado?.id : rest.empaquetado)
          : null;

        return {
          ...rest,
          materia_prima: rest.materia_prima || null,
          producto_reventa: rest.producto_reventa || null,
          unidad_medida_compra: unitId,
          empaquetado: empaquetadoId,
          costo_unitario_ves: roundTo3(rest.costo_unitario_usd * tasaCambio),
          subtotal_linea_usd: rest.subtotal_linea_usd,
          subtotal_linea_ves: roundTo3(rest.subtotal_linea_usd * tasaCambio),
        };
      });

      return {
        ...data,
        detalles: details,
      };
    },
    [watch, roundTo3],
  );

  const resetAmounts = useCallback(() => {
    setValue("monto_total_oc_usd", 0);
    setValue("monto_total_oc_ves", 0);
  }, [setValue]);

  return {
    roundTo3,
    calculateTotalFromItems,
    prepareDataForSubmit,
    resetAmounts,
  };
};
