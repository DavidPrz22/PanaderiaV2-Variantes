import { RangeDatePicker } from "../../../components/RangeDatePicker";
import { Button } from "@/components/ui/button";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

import type { DateRange } from "react-day-picker";
import { TrashIcon } from "lucide-react";
import { useRecetasContext } from "@/context/RecetasContext";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const RecetaFechaFiltro = () => {

    const { setFechaSeleccionadaFiltro } = useRecetasContext();
    const [fechaSeleccionada, setFechaSeleccionada] = useState<DateRange | undefined>(undefined);

    const handleSelect = (selected: DateRange | undefined) => {
        setFechaSeleccionada(selected);
    }

    const resetDates = () => {
        setFechaSeleccionada(undefined);
        setFechaSeleccionadaFiltro(undefined);
    }

    const setFiltroDates = () => {
        const stringifiedDates = {
            from: fechaSeleccionada?.from ? format(fechaSeleccionada.from, 'yyyy-MM-dd') : '',
            to: fechaSeleccionada?.to ? format(fechaSeleccionada.to, 'yyyy-MM-dd') : ''
        };
        setFechaSeleccionadaFiltro(stringifiedDates);
    }

    const fechaSeleccionadaUsed = () => (fechaSeleccionada?.from !== undefined || fechaSeleccionada?.to !== undefined) ? false : true

    const selectedDates = () => {
        if (fechaSeleccionada?.from && fechaSeleccionada.to) return (
            <div className="flex flex-col items-center">
                <div className="text-[Roboto] text-center font-semibold text-sm mb-2">Fechas seleccionadas</div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center p-2 gap-3 border rounded-md w-fit">
                        <div className="text-[Roboto] text-center font-semibold text-sm">{format(fechaSeleccionada.from, 'PPP', { locale: es })}</div>
                        -
                        <div className="text-[Roboto] text-center font-semibold text-sm">{format(fechaSeleccionada.to, 'PPP', { locale: es })}</div>
                    </div>
                    <Button variant="outline" size="lg" className="cursor-pointer" onClick={resetDates}><TrashIcon /></Button>
                </div>
            </div>
        )
    }
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='outline' size='lg' className="cursor-pointer">Fecha de creación</Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit mr-4 border border-gray-200 rounded-md shadow-sm">
                <div className="text-[Roboto] text-center font-semibold text-sm mb-2">Selecciona un rango de fecha para filtrar los resultados</div>

                {selectedDates()}

                <RangeDatePicker
                    selected={fechaSeleccionada}
                    onSelect={handleSelect}
                />

                <Button
                    className="block ml-auto cursor-pointer"
                    size="lg"
                    disabled={fechaSeleccionadaUsed()}
                    onClick={setFiltroDates}>Aplicar
                </Button>

            </PopoverContent>
        </Popover>
    )
}