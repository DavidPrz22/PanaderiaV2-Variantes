import { ProductionRecordHeader } from "./ProductionRecordHeader";
import { ProductionRecordCantidad } from "./ProductionRecordCantidad";
import { ProductionRecordFooter } from "./ProductionRecordFooter";
import { ProductionRecordFechaProductor } from "./ProductionRecordFechaProductor";
import type { ProductionDetails } from "../types/types";
// Mock catalog of elaborated products used in registeredProductions



export function ProductionRecord({ production }: { production: ProductionDetails }) {
  return (
    <div className="p-6 pt-0 font-[Roboto]">
      <div
        key={production.id}
        className="border-2 border-blue-100 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-[border, box-shadow] duration-300"
      >
        <ProductionRecordHeader
          nombre={production.producto_produccion}
        />  

        <ProductionRecordFechaProductor
          fecha_produccion={new Date(
            production.fecha_produccion,
          ).toLocaleDateString()}
          fecha_vencimiento={new Date(
            production.fecha_expiracion,
          ).toLocaleDateString()}
          registrado_por={production.usuario_produccion}
        />

        <ProductionRecordCantidad
          cantidad_producida={Number(production.cantidad_producida)}
          unidad_medida={production.unidad_medida_produccion}
        />

        {/* Components Used */}
        <div className="rounded-lg p-4 bg-gray-100">
          <h4 className="text-sm font-semibold mb-3">Componentes Utilizados</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {production.componentes_produccion.map((componente, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm py-1"
              >
                <span className="">{componente.materia_prima_consumida || componente.producto_intermedio_consumido}</span>
                <span className="font-medium">
                  {(Number(componente.cantidad_consumida)).toFixed(2) + " " + componente.unidad_medida}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ID Footer */}
        <ProductionRecordFooter id={production.id.toString()} costo_total_componentes_divisa={production.costo_total_componentes_divisa} costo_total_componentes_local={production.costo_total_componentes_local} />
      </div>
    </div>
  );
}
