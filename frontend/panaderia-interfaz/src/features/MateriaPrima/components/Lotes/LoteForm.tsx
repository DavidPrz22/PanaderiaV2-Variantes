import { useEffect } from "react";
import { ArrowLeft, CalendarIcon, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";
import { loteMateriaPrimaSchema, type TLoteMateriaPrimaSchema } from "../../schemas/schemas";
import { useCreateUpdateLoteMateriaPrimaMutation } from "../../hooks/mutations/materiaPrimaMutations";
import type { LoteMateriaPrimaFormResponse, LoteMateriaPrimaFormSumit } from "../../types/types";
import { useMateriaPrimaDetallesQuery } from "../../hooks/queries/materiaPrimaqueries";
import { useProveedoresQuery } from "@/hooks/useQueryHooks";

interface LoteFormProps {
    materiaPrimaId: number;
    initialData?: LoteMateriaPrimaFormResponse;
    onClose: () => void;
    onSuccess: () => void;
}

export const LoteForm = ({ materiaPrimaId, initialData, onClose, onSuccess }: LoteFormProps) => {

    const { materiaprimaId } = useMateriaPrimaContext();
    const { data: materiaprimaDetalles } = useMateriaPrimaDetallesQuery(materiaprimaId!);


    const { data: proveedores = [], isLoading: isLoadingProveedores } = useProveedoresQuery();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<TLoteMateriaPrimaSchema>({
        resolver: zodResolver(loteMateriaPrimaSchema),
        defaultValues: {
            proveedor_id: 0,
            fecha_recepcion: new Date(),
            fecha_caducidad: new Date(),
            cantidad_recibida: 0,
            costo_unitario_local: 0,
            costo_unitario_divisa: 0,
        },
    });

    const isUpdate = !!initialData;

    const mutation = useCreateUpdateLoteMateriaPrimaMutation(
        onSuccess,
        reset,
        isUpdate,
        initialData?.id
    );

    useEffect(() => {
        if (initialData) {
            reset({
                proveedor_id: initialData.proveedor.id,
                fecha_recepcion: new Date(initialData.fecha_recepcion),
                fecha_caducidad: new Date(initialData.fecha_caducidad),
                cantidad_recibida: initialData.cantidad_recibida,
                costo_unitario_local: initialData.costo_unitario_usd, // Mocking local cost with usd as API doesn't seem to have both
                costo_unitario_divisa: initialData.costo_unitario_usd,
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: TLoteMateriaPrimaSchema) => {
        const submitData: LoteMateriaPrimaFormSumit = {
            materia_prima: materiaPrimaId,
            proveedor_id: data.proveedor_id,
            fecha_recepcion: data.fecha_recepcion,
            fecha_caducidad: data.fecha_caducidad,
            cantidad_recibida: data.cantidad_recibida,
            stock_actual_lote: data.cantidad_recibida,
            costo_unitario_usd: data.costo_unitario_divisa,
            detalle_oc: null,
        };
        if (isUpdate) submitData.id = initialData?.id;
        mutation.mutate(submitData);
    };

    const unidadBase = materiaprimaDetalles?.unidad_medida_base?.abreviatura || "";

    return (
        <div className="h-full bg-background flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b">
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-semibold">
                        {isUpdate ? "Editar Lote" : "Nuevo Lote"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {materiaprimaDetalles?.nombre}
                    </p>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-w-4xl mx-auto">
                    {/* Proveedor */}
                    <div className="space-y-2">
                        <Label>Proveedor *</Label>
                        {isLoadingProveedores ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cargando proveedores...
                            </div>
                        ) : (
                            <Select
                                value={watch("proveedor_id")?.toString()}
                                onValueChange={(value) => setValue("proveedor_id", parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar proveedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {proveedores.map((p) => (
                                        <SelectItem key={p.id} value={p.id?.toString() || ""}>
                                            {p.nombre_comercial || `${p.nombre_proveedor} ${p.apellido_proveedor}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {errors.proveedor_id && (
                            <p className="text-xs text-destructive">{errors.proveedor_id.message}</p>
                        )}
                    </div>

                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Fecha Recepción */}
                        <div className="space-y-2">
                            <Label>Fecha de Recepción *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !watch("fecha_recepcion") && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {watch("fecha_recepcion") ? (
                                            format(watch("fecha_recepcion"), "dd/MM/yyyy", { locale: es })
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={watch("fecha_recepcion")}
                                        onSelect={(date) => date && setValue("fecha_recepcion", date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.fecha_recepcion && (
                                <p className="text-xs text-destructive">{errors.fecha_recepcion.message}</p>
                            )}
                        </div>

                        {/* Fecha Caducidad */}
                        <div className="space-y-2">
                            <Label>Fecha de Caducidad *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !watch("fecha_caducidad") && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {watch("fecha_caducidad") ? (
                                            format(watch("fecha_caducidad"), "dd/MM/yyyy", { locale: es })
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={watch("fecha_caducidad")}
                                        onSelect={(date) => date && setValue("fecha_caducidad", date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.fecha_caducidad && (
                                <p className="text-xs text-destructive">{errors.fecha_caducidad.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Cantidad Recibida */}
                    <div className="space-y-2">
                        <Label>Cantidad Recibida *</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...register("cantidad_recibida", { valueAsNumber: true })}
                                placeholder="0.00"
                                className="pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                {unidadBase}
                            </span>
                        </div>
                        {errors.cantidad_recibida && (
                            <p className="text-xs text-destructive">{errors.cantidad_recibida.message}</p>
                        )}
                    </div>

                    {/* Costs Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Costo Unitario Divisa */}
                        <div className="space-y-2">
                            <Label>Costo Unitario ($) *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register("costo_unitario_divisa", { valueAsNumber: true })}
                                    placeholder="0.00"
                                    className="pl-7"
                                />
                            </div>
                            {errors.costo_unitario_divisa && (
                                <p className="text-xs text-destructive">{errors.costo_unitario_divisa.message}</p>
                            )}
                        </div>

                        {/* Costo Unitario Local */}
                        <div className="space-y-2">
                            <Label>Costo Unitario Local *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...register("costo_unitario_local", { valueAsNumber: true })}
                                placeholder="0.00"
                            />
                            {errors.costo_unitario_local && (
                                <p className="text-xs text-destructive">{errors.costo_unitario_local.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {mutation.isPending ? "Guardando..." : isUpdate ? "Actualizar Lote" : "Guardar Lote"}
                        </Button>
                    </div>
                </form>
            </ScrollArea>
        </div>
    );
};
