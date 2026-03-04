export const PILotesHeader = () => {
    return (
        <div className="p-4 grid grid-cols-7 font-bold font-[Roboto] text-sm bg-[var(--table-header-bg)]">
            <div>Stock Inicial</div>
            <div>Stock actual</div>
            <div>Fecha de caducidad</div>
            <div>Fecha de producción</div>
            <div>Costo total</div>
            <div>Estado</div>
            <div>Acciones</div>
        </div>
    );
};