import { WarningIcon } from "@/assets/DashboardAssets";
import { useProductionContext } from "@/context/ProductionContext";

export const ProductionWarning = () => {

  const { insufficientStock } = useProductionContext();

  return insufficientStock && insufficientStock.length > 0 ? (
    <div
      className="p-4 mt-6 text-sm text-yellow-800 rounded-lg bg-yellow-50/40 dark:bg-gray-800 dark:text-yellow-200 border border-gray-200 "
      role="alert"
    >
      <img
        src={WarningIcon}
        alt="Warning"
        className="size-4 inline-block mr-2"
      />{" "}
      Algunos componentes o subrecetas no tienen stock suficiente. Ajusta las
      cantidades o verifica el inventario.
      <div className="pl-6 mt-2">
        <strong>Componentes con stock insuficiente:</strong>
        {insufficientStock.map((item) => (
          <div key={item.componente_id}>
            {item.nombre} - {item.stock} {item.unidad_medida}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <></>
  );
};

