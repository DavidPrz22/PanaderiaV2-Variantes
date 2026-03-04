interface LoteDatesProps {
    fechaProduccion: string;
    fechaCaducidad: string;
}

export const LoteDates = ({ fechaProduccion, fechaCaducidad }: LoteDatesProps) => {
    return (
        <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Fechas
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fecha Producción</p>
                    <p className="font-medium">{fechaProduccion}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fecha Caducidad</p>
                    <p className="font-medium">{fechaCaducidad}</p>
                </div>
            </div>
        </div>
    );
};
