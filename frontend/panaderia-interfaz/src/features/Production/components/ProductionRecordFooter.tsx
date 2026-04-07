export const ProductionRecordFooter = ({ id, costo_total_componentes_divisa, costo_total_componentes_local }: { id: string, costo_total_componentes_divisa: string, costo_total_componentes_local: string }) => {
  return (
    <div className="mt-4 pt-3 border-t border-gray-300">
      <div className="flex justify-between items-center text-xs">
        <span>ID: #{id}</span>

        <span className="font-medium text-md">Costo Total Divisa: ${Number(costo_total_componentes_divisa).toFixed(2)}</span>
        <span className="font-medium text-md">Costo Total Moneda Local: ${Number(costo_total_componentes_local).toFixed(2)}</span>
      </div>
    </div>
  );
};
