interface LoteMeasurementsProps {
    pesoTotalGramos: string | number | null;
    volumenTotalMl: string | number | null;
}

export const LoteMeasurements = ({ pesoTotalGramos, volumenTotalMl }: LoteMeasurementsProps) => {
    return (
        <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Mediciones
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Peso Total (g)</p>
                    <p className="font-medium">
                        {pesoTotalGramos !== null ? `${pesoTotalGramos} g` : "-"}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Volumen Total (ml)</p>
                    <p className="font-medium">
                        {volumenTotalMl !== null ? `${volumenTotalMl} ml` : "-"}
                    </p>
                </div>
            </div>
        </div>
    );
};
