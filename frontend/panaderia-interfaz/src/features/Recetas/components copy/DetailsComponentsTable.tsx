import { useRecetasContext } from "@/context/RecetasContext";
import React from "react";

export const DetailsComponentsTable = () => {
  const { recetaDetalles } = useRecetasContext();

  if (!recetaDetalles) return null;

  const headers = ["Componente", "Tipo de componente", "Cantidad", "Unidad"];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-lg font-semibold text-blue-700 font-[Roboto]">
        Componentes de la receta:
      </div>

      <div className="grid grid-cols-[1fr_1fr_0.5fr_0.5fr] border-t border-l min-w-[650px] w-[80%] border-gray-300 ">
        {/* Table Headers */}
        {headers.map((header) => (
          <div
            key={header}
            className="text-lg font-semibold font-[Roboto] p-4 bg-[var(--table-header-bg)] text-[var(--table-header-text)] border-r border-b border-gray-300"
          >
            {header}
          </div>
        ))}

        {/* Table Data Rows */}
        {recetaDetalles.componentes.map((componente) => (
          <React.Fragment key={componente.id}>
            <div className="py-2 px-4 border-b border-r border-gray-300 font-[Roboto] text-md">
              {componente.nombre}
            </div>
            <div className="py-2 px-4 border-b border-r border-gray-300 font-[Roboto] text-md">
              {componente.tipo}
            </div>
            <div className="py-2 px-4 border-b border-r border-gray-300 font-[Roboto] text-md">
              {componente.cantidad}
            </div>
            <div className="py-2 px-4 border-b border-r border-gray-300 font-[Roboto] text-md">
              {componente.unidad_medida}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
