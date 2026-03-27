import { useRecetasContext } from "@/context/RecetasContext";

export default function DetailsRecetasRelacionadas() {
  const { recetaDetalles } = useRecetasContext();
  return (
    <div className="flex flex-col border border-b-0 border-gray-300 rounded-md min-w-[650px] w-[50%]">
      <h1 className="text-lg font-bold p-2 border-b border-gray-300 bg-[var(--table-header-bg)] text-[var(--table-header-text)]">
        Recetas Relacionadas
      </h1>
      <ul className="flex flex-col">
        {recetaDetalles?.relaciones_recetas.map((relacion) => (
          <li className="p-2 border-b border-gray-300" key={relacion.id}>
            {relacion.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}
