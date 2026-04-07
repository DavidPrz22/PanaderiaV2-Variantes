import { ProductionComponentItem } from "./ProductionComponentItem";
import { ProductionComponentsHeader } from "./ProductionComponentsHeader";
import { DoubleSpinnerLoading } from "@/components/DoubleSpinnerLoading";
import { useComponentsProductionQuery } from "../hooks/queries/ProductionQueries";
import type {
  ComponentesLista,
  subreceta,
  watchSetvalueTypeProductionWithSubmit,
} from "../types/types";
import { ProductionSubComponents } from "./ProductionSubComponents";
import { ChefHatIcon } from "@/assets/DashboardAssets";
import { ProductionWarning } from "./ProductionWarning";
import { useProductionContext } from "@/context/ProductionContext";
import { useEffect, useMemo, memo } from "react";
import ProductionButtons from "./ProductionButtons";

type Componente = ComponentesLista[number];

const ProductionComponentsBase = ({
  setValue,
  watch,
  onSubmit,
  resetProduction,
}: watchSetvalueTypeProductionWithSubmit & { resetProduction: () => void }) => {
  const { data: productionComponentes, isFetching, isFetched } = useComponentsProductionQuery();

  const { setInsufficientStock, componentesBaseProduccion, setComponentesBaseProduccion, setMedidaFisica, esPorUnidad, setEsPorUnidad } = useProductionContext();

  // Cantidad a producir desde el formulario no es necesaria para escalar mas


  const roundTo3 = (n: number) => Math.round(n * 1000) / 1000;

  // Store unscaled base componentes from backend in context when fetched
  useEffect(() => {
    if (!isFetched) return;
    const base = productionComponentes?.componentes ?? [];
    // Preserve previously added additional components
    setComponentesBaseProduccion((prev: ComponentesLista) => {
      const additional = (prev || []).filter((c) => c.isAdditional);
    const baseIds = new Set(base.map((c) => c.componente_id));
    const additionalFiltered = additional.filter((c) => !baseIds.has(c.componente_id));
    return [...base, ...additionalFiltered] as ComponentesLista;
    });
  }, [isFetched, productionComponentes, setComponentesBaseProduccion]);


  useEffect(() => {
    if (!isFetched || !productionComponentes) return;

    const medidaRaw = productionComponentes.medida_produccion;
    const m = typeof medidaRaw === "string" ? medidaRaw.toLowerCase() : undefined;

    setEsPorUnidad((
      (productionComponentes.es_por_unidad === true) ||
      (typeof m === "string" && m === "unidad")
    ));

    if (productionComponentes.tipo_medida_fisica) {
      setMedidaFisica(productionComponentes.tipo_medida_fisica);
    }

  }, [isFetched, productionComponentes, setMedidaFisica, setEsPorUnidad]);


  const componentesPrincipalesProducts: Componente[] = useMemo(() => {
    const base = componentesBaseProduccion ?? [];
    return base.map((c) => {
      const original = c.cantidad ?? 0;
      // Keep original quantities regardless of unit-based scaling
      return { ...c, cantidad: roundTo3(original) };
    });
  }, [componentesBaseProduccion]);

  // Escalar cantidades de subrecetas por la cantidad a producir
  const subrecetasProducts: subreceta[] = useMemo(() => {

    const subs = productionComponentes?.subrecetas ?? [];
    // Keep original quantities regardless of unit-based scaling
    return subs.map((sr) => ({
      ...sr,
      componentes: sr.componentes.map((c) => ({
        ...c,
        cantidad: roundTo3(c.cantidad ?? 0),
      })),
    }));
  }, [productionComponentes]);

  // Unificar y sumar por componente (base + subrecetas) con cantidades escaladas
  const componentesEnProducto: ComponentesLista = useMemo(() => {
    const all: ComponentesLista = [
      ...componentesPrincipalesProducts.map((c) => ({ ...c })),
    ];
    subrecetasProducts.forEach(({ componentes }) => {
      componentes.forEach((componente) => {
        const index = all.findIndex((c) => c.componente_id === componente.componente_id);
        if (componente.componente_id && index === -1) {
          all.push({ ...componente });
        } else if (index !== -1) {
          const newComponent = { ...all[index] };
          newComponent.cantidad = roundTo3(
            newComponent.cantidad + componente.cantidad,
          );
          all[index] = newComponent;
        }
      });
    });
    return all;
  }, [componentesPrincipalesProducts, subrecetasProducts]);

  const watchedComponentes = watch?.("componentes") as { componente_id: number; cantidad: number }[] | undefined;

  const currentInsufficientStock = useMemo(() => {
    const formMap = new Map((watchedComponentes ?? []).map((c) => [c.componente_id, c.cantidad]));

    return componentesEnProducto.filter((c) => {
      let quantityToCheck = c.cantidad;
      if (!esPorUnidad) {
        quantityToCheck = formMap.get(c.componente_id) ?? c.cantidad;
      }
      return c.stock < quantityToCheck;
    });
  }, [componentesEnProducto, watchedComponentes, esPorUnidad]);

  useEffect(() => {
    setInsufficientStock(currentInsufficientStock);
  }, [currentInsufficientStock, setInsufficientStock]);


  useEffect(() => {
    if (!isFetched) return;

    const existing = (watch?.("componentes") as { componente_id: number; cantidad: number; tipo?: string }[] | undefined) ?? [];
    const byId = new Map(existing.map((c) => [c.componente_id, c]));

    const merged = componentesEnProducto.map(({ componente_id, cantidad, tipo }) => {
      const prev = byId.get(componente_id);
      const chosenCantidad = esPorUnidad
        ? roundTo3(cantidad) // scale/refresh when unit-based
        : typeof prev?.cantidad === "number"
          ? roundTo3(prev.cantidad) // preserve user edits when not unit-based
          : roundTo3(cantidad);     // initial load fallback
      return { componente_id, cantidad: chosenCantidad, tipo: tipo || "MateriaPrima" };
    });

    setValue?.("componentes", merged, { shouldValidate: true });
  }, [isFetched, componentesEnProducto, esPorUnidad, setValue, watch]);




  return (
    <>
      {isFetching && <DoubleSpinnerLoading extraClassName="size-30 mt-4" />}

      {isFetched && componentesPrincipalesProducts.length > 0 && (
        <div className="p-6 border border-gray-200 rounded-lg bg-white mt-6 shadow-md">
          <ProductionComponentsHeader />
          {productionComponentes?.rendimiento && (
            <small className="text-gray-500 text-sm">
              Rendimiento de receta: {productionComponentes.rendimiento} {productionComponentes.medida_produccion}
            </small>
          )}
          <ProductionWarning />
          <div className="flex flex-col gap-2 mt-8">
            {componentesPrincipalesProducts.map((componente) => (
              <ProductionComponentItem
                key={componente.componente_id}
                componente_id={componente.componente_id}
                titulo={componente.nombre}
                stock={componente.stock}
                unidad={componente.unidad_medida}
                cantidad={componente.cantidad}
                tipo={componente.tipo}
                isAdditional={componente.isAdditional}
                setValue={setValue}
                watch={watch}
              />
            ))}

            {subrecetasProducts.length > 0 && (
              <div className="space-y-4 border-t mt-5 pt-7 border-gray-200">
                <div className="text-lg font-semibold flex gap-2">
                  <img src={ChefHatIcon} className="size-6" alt="" />
                  Recetas Relacionadas:
                </div>
                {subrecetasProducts.map((sr, index) => (
                  <ProductionSubComponents
                    key={`${sr.nombre}-${index}`}
                    subreceta={sr}
                    setValue={setValue}
                    watch={watch}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isFetched && !isFetching && componentesPrincipalesProducts.length === 0 && (
        <div className="p-4 border border-gray-200 rounded-lg bg-white mt-6 shadow-md">
          <div className="p-4 text-gray-800 font-bold">
            No hay componentes disponibles
          </div>
        </div>
      )}

      {
        componentesPrincipalesProducts.length > 0 && (
          <ProductionButtons
            onSubmit={onSubmit}
            resetProduction={resetProduction}
          />
        )
      }
    </>
  );
};

export const ProductionComponents = memo(ProductionComponentsBase);
ProductionComponents.displayName = "ProductionComponents";
