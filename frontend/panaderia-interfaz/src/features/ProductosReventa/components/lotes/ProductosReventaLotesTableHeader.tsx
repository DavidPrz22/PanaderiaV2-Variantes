export const ProductosReventaLotesTableHeader = () => {
  return (
    <div className="p-4 grid grid-cols-7 font-bold font-[Roboto] text-sm bg-gray-50 border-b border-gray-300 rounded-t-lg">
      <div>Cantidad Recibida</div>
      <div>Stock Actual</div>
      <div>Fecha de Caducidad</div>
      <div>Fecha de Recepción</div>
      <div>Costo Unitario</div>
      <div>Estado</div>
      <div>Acciones</div>
    </div>
  );
};
